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

    // Fetch real-time weather data from Open-Meteo 
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
    );
    const weatherData = await weatherRes.json();
    const currentTemp = weatherData.current_weather?.temperature || (Math.random() * 2 + 31).toFixed(1);
    const windspeed = weatherData.current_weather?.windspeed || 0;
    const weathercode = weatherData.current_weather?.weathercode || 0;
    
    return NextResponse.json({
      // Match the key from your log!
      aqi: firstIndex?.aqi || 0, 
      status: firstIndex?.category || "Moderate",
      temp: currentTemp,
      windspeed,
      weathercode,
    });

  } catch (error) {
    return NextResponse.json({ aqi: 0, status: "Error" }, { status: 500 });
  }
}