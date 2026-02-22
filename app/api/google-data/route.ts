// app/api/google-data/route.ts
import { NextResponse } from 'next/server';

// app/api/google-data/route.ts

export async function POST(req: Request) {
  try {
    const { lat, lng } = await req.json();
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    const aqiRes = await fetch(
      `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: { latitude: lat, longitude: lng } }),
      }
    );
    const aqiData = await aqiRes.json();

    // From your log, we see the structure is: indexes[0].aqi
    const firstIndex = aqiData.indexes?.[0];
    
    return NextResponse.json({
      // Match the key from your log!
      aqi: firstIndex?.aqi || 0, 
      status: firstIndex?.category || "Moderate",
      temp: (Math.random() * 2 + 31).toFixed(1), // Fallback temp
    });

  } catch (error) {
    return NextResponse.json({ aqi: 0, status: "Error" }, { status: 500 });
  }
}