import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { lat, lng } = await req.json();
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    // 1. Fetch REAL Weather (Check for Rain)
    const weatherUrl = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${API_KEY}&location.latitude=${lat}&location.longitude=${lng}`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();
    console.log("Weather API URL:", weatherUrl);
    console.log("Weather API Response:", weatherData);
    // Extract precipitation percentage
    const rainChance = weatherData.precipitation?.probability?.percent || 0;
    const rainMultiplier = 1 + (rainChance / 50); // Risk doubles if 50% rain chance

    // 2. Fetch Elevation Grid
    const points = [];
    const step = 0.0015;
    const jitter = step * 0.4; // 40% of the step size as random shift
    for (let i = -5; i < 5; i++) {
      for (let j = -5; j < 5; j++) {
        points.push({
          lat: lat + i * step + (Math.random() - 0.5) * jitter,
          lng: lng + j * step + (Math.random() - 0.5) * jitter,
        });
      }
    }

    const locations = points.map((p) => `${p.lat},${p.lng}`).join("|");
    const elevUrl = `https://maps.googleapis.com/maps/api/elevation/json?locations=${locations}&key=${API_KEY}`;
    const elevRes = await fetch(elevUrl);
    const elevData = await elevRes.json();
    console.log("Elevation API URL:", elevUrl);
    console.log("Elevation API Response:", elevData);

    if (!elevData.results || elevData.results.length === 0) {
      console.warn("No elevation data returned.");
      return NextResponse.json([]);
    }

    const maxElev = Math.max(...elevData.results.map((r: any) => r.elevation));

    const finalPoints = elevData.results.map((r: any) => {
      const depth = Math.max(0, maxElev - r.elevation);
      return {
        lat: r.location.lat,
        lng: r.location.lng,
        // Weight: (Depth squared) * (Real Rain Factor)
        weight: Math.pow(depth, 2) * rainMultiplier
      };
    });

    console.log("Flood Final Points:", finalPoints);
    return NextResponse.json(finalPoints); // Return array directly!

  } catch (error) {
    return NextResponse.json([]);
  }
}