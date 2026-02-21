// app/api/solar-grid/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { lat, lng } = await req.json();
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    // 1. INCREASE DENSITY: 10x10 grid (100 probes)
    // 2. INCREASE SPREAD: 0.015 (~1.5km area) to find more mapped buildings
    const points: { lat: number; lng: number }[] = [];
    const spread = 3.0; 
    const step = spread / 10;

    for (let i = -5; i < 5; i++) {
      for (let j = -5; j < 5; j++) {
        points.push({ 
          lat: lat + (i * step), 
          lng: lng + (j * step) 
        });
      }
    }

    // 3. Perform the Deep Scan
    const results = await Promise.all(
      points.map(async (p) => {
        try {
          // Google findClosest looks for the nearest processed building
          const url = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${p.lat}&location.longitude=${p.lng}&key=${API_KEY}`;
          const res = await fetch(url);
          const data = await res.json();

          if (data && data.solarPotential) {
            return {
              // We use Google's EXACT building center, not our grid point
              lat: data.center.latitude,
              lng: data.center.longitude,
              weight: data.solarPotential.maxArrayPanels,
              id: data.name, // Use Google's unique building ID to prevent duplicates
              area: Math.round(data.solarPotential.wholeRoofStats.areaMeters2)
            };
          }
        } catch (e) {
          return null;
        }
        return null;
      })
    );

    // 4. DE-DUPLICATION: 
    // Since 'findClosest' might return the same building for multiple points, 
    // we filter by unique ID so we don't draw 10 dots on one roof.
    const uniqueBuildingsMap = new Map();
    results.forEach(r => {
      if (r && !uniqueBuildingsMap.has(r.id)) {
        uniqueBuildingsMap.set(r.id, r);
      }
    });

    const finalRealData = Array.from(uniqueBuildingsMap.values());

    console.log(`Deep Scan found ${finalRealData.length} unique verified buildings.`);
    return NextResponse.json(finalRealData);

  } catch (error) {
    return NextResponse.json([]);
  }
}