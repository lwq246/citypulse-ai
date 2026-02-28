import { logApiMetric } from "@/utils/serverMetrics";
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const startedAt = Date.now();

  try {
    const { lat, lng } = await req.json();
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const coords = { latitude: lat, longitude: lng };

    console.log(`--- [GOOGLE DATA] Fetching for: ${lat}, ${lng} ---`);

    // 1. Fetch REAL Google Air Quality (POST)
    const aqiUrl = `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${API_KEY}`;
    const aqiRes = await fetch(aqiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location: coords }),
    });
    const aqiData = await aqiRes.json();
    
    console.log(`[AIR QUALITY] Received:`, JSON.stringify(aqiData?.indexes?.[0] || "No Data"));

    // 2. Fetch REAL Google Weather (GET)
    const weatherUrl = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${API_KEY}&location.latitude=${lat}&location.longitude=${lng}`;
    console.log(`[WEATHER] Requesting URL: ${weatherUrl}`);

    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();
    
    // Log Sample of weather response to verify keys
    console.log(`[WEATHER] Raw Temperature Data:`, weatherData?.temperature);
    console.log(`[WEATHER] Raw Condition Type:`, weatherData?.weatherCondition?.type);

    // --- DATA EXTRACTION ---
    const firstIndex = aqiData.indexes?.[0];
    const temp = weatherData.temperature?.degrees || 31.0;
    const windspeed = weatherData.wind?.speed?.value || 0;
    const conditionText = weatherData.weatherCondition?.description?.text || "Clear";
    const weatherType = weatherData.weatherCondition?.type || "CLEAR";
    console.log(`[DATA EXTRACTION] Temp: ${temp}°C, Wind Speed: ${windspeed} m/s, Condition: ${conditionText}, Type: ${weatherType}`);
    // --- SMART MAPPING FOR WEATHERCODE ---
    // Mapping Google String Types to the Numeric Codes used in your MapBox.tsx
    let weathercode = 0;
    if (weatherType.includes("RAIN") || weatherType.includes("DRIZZLE")) {
      weathercode = 61;
      console.log(">>> RAIN DETECTED (Code 61)");
    } else if (weatherType.includes("THUNDERSTORM")) {
      weathercode = 95;
      console.log(">>> THUNDERSTORM DETECTED (Code 95)");
    } else if (weatherType.includes("SNOW")) {
      weathercode = 71;
    }

    const finalPayload = {
      aqi: firstIndex?.aqi || 0,
      status: firstIndex?.category || "Moderate",
      temp: temp,
      windspeed: windspeed,
      condition: conditionText,
      weathercode: weathercode,
    };

    console.log(`[FINAL PAYLOAD] Sent to Frontend:`, finalPayload);
    console.log(`--- [GOOGLE DATA] Done ---`);

    logApiMetric({
      route: "/api/google-data",
      status: 200,
      success: true,
      durationMs: Date.now() - startedAt,
      extra: {
        weathercode,
        hasAqi: Number.isFinite(finalPayload.aqi),
      },
    });

    return NextResponse.json(finalPayload);

  } catch (error: any) {
    console.error("!!! [ENVIRONMENTAL API ERROR]:", error.message);
    logApiMetric({
      route: "/api/google-data",
      status: 500,
      success: false,
      durationMs: Date.now() - startedAt,
      extra: { error: error?.message || "unknown" },
    });
    return NextResponse.json({ aqi: 0, status: "Error", temp: 31.0, weathercode: 0 }, { status: 500 });
  }
}