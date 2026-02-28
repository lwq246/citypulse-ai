import { NextResponse } from "next/server";
import { logApiMetric } from "@/utils/serverMetrics";

export async function POST(req: Request) {
  const startedAt = Date.now();

  try {
    const { lat, lng } = await req.json();
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    // 1. GENERATE GRID COORDINATES
    // 12x12 grid = 144 points (Safe for Elevation API batch limit of 512)
    const points: { lat: number; lng: number }[] = [];
    const spread = 0.015; 
    const steps = 12;
    const stepSize = spread / steps;
    const jitter = stepSize * 0.7; // Break the grid look

    for (let i = -6; i < 6; i++) {
      for (let j = -6; j < 6; j++) {
        points.push({
          lat: lat + (i * stepSize) + (Math.random() - 0.5) * jitter,
          lng: lng + (j * stepSize) + (Math.random() - 0.5) * jitter,
        });
      }
    }

    // 2. FETCH REAL AMBIENT TEMPERATURE (1 Request)
    // Since temperature is uniform in a 1km radius, we get the truth for the center.
    const weatherUrl = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${API_KEY}&location.latitude=${lat}&location.longitude=${lng}`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();
    
    // Extract base temperature from the JSON format provided
    const baseTemp = weatherData?.temperature?.degrees ;

    // 3. FETCH REAL TOPOGRAPHY (1 Batch Request)
    // We send all 144 points to Google in one single pipe-separated string
    const locationsString = points.map(p => `${p.lat},${p.lng}`).join("|");
    const elevUrl = `https://maps.googleapis.com/maps/api/elevation/json?locations=${locationsString}&key=${API_KEY}`;
    const elevRes = await fetch(elevUrl);
    const elevData = await elevRes.json();

    if (!elevData.results) {
      throw new Error("Elevation API failed");
    }

    // 4. COMBINE DATA FOR THE FRONTEND
    // We map the elevation results back to our points and include the base temperature
    const combinedPoints = elevData.results.map((result: any) => {
      return {
        lat: result.location.lat,
        lng: result.location.lng,
        elevation: result.elevation,
        temperature: baseTemp // Attach real ambient temp
      };
    });

    // console.log(`Thermal Scan Complete: ${combinedPoints.length} nodes processed at ${baseTemp}°C`);

    logApiMetric({
      route: "/api/thermal-grid",
      status: 200,
      success: true,
      durationMs: Date.now() - startedAt,
      extra: { pointCount: combinedPoints.length },
    });

    return NextResponse.json(combinedPoints);
  } catch (error: any) {
    console.error("Backend error:", error.message);
    logApiMetric({
      route: "/api/thermal-grid",
      status: 500,
      success: false,
      durationMs: Date.now() - startedAt,
      extra: { error: error?.message || "unknown" },
    });
    return NextResponse.json([]);
  }
}