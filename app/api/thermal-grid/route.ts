import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { lat, lng } = await req.json();
    // Use backend environment variable for Google Weather API key
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    const points: { lat: number; lng: number }[] = [];
    const spread = 0.015;
    const step = spread / 10;
    const jitter = step * 0.8; 

    for (let i = -5; i < 5; i++) {
      for (let j = -5; j < 5; j++) {
        points.push({
          // Add the Jitter directly to the coordinates
          lat: lat + (i * step) + (Math.random() - 0.5) * jitter,
          lng: lng + (j * step) + (Math.random() - 0.5) * jitter,
        });
      }
    }

    const weatherPromises = points.map(async (p) => {
      const weatherUrl = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${API_KEY}&location.latitude=${p.lat}&location.longitude=${p.lng}`;
      const res = await fetch(weatherUrl, { method: "GET" });
      if (!res.ok) return null;
      const weatherData = await res.json();
      const temp = weatherData?.temperature?.degrees;
      return temp !== undefined ? { lat: p.lat, lng: p.lng, temperature: temp } : null;
    });

    const weatherResults = await Promise.all(weatherPromises);
    const realTemperaturePoints = weatherResults.filter(Boolean);
    return NextResponse.json(realTemperaturePoints);
  } catch (error) {
    console.error("Backend error:", error);
    return NextResponse.json([]);
  }
}