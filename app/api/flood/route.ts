// app/api/flood/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { lat, lng } = await req.json();
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    // 1. Call Google Elevation API
    const url = `https://maps.googleapis.com/maps/api/elevation/json?locations=${lat},${lng}&key=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    console.log("RAW GOOGLE ELEVATION DATA:", JSON.stringify(data, null, 2));
    if (data.status === "OK" && data.results.length > 0) {
      const elevation = data.results[0].elevation; // in meters
      
      // 2. URBAN FLOOD LOGIC (Based on KL Topography)
      // Most of KL is between 20m and 100m. 
      // Areas below 35m in urban zones are usually higher risk.
      let risk = "Low";
      let depth = "0.0m";
      
      if (elevation < 30) {
        risk = "Critical";
        depth = "0.8m - 1.5m";
      } else if (elevation < 45) {
        risk = "Moderate";
        depth = "0.2m - 0.5m";
      }

      return NextResponse.json({
        elevation: elevation.toFixed(1),
        riskLevel: risk,
        estDepth: depth,
        source: "Google Elevation API"
      });
    }

    return NextResponse.json({ error: "No elevation data" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: "API Failure" }, { status: 500 });
  }
}