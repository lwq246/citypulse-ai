// app/api/solar-grid/route.ts
import { NextResponse } from "next/server";
import { logApiMetric } from "@/utils/serverMetrics";

export async function POST(req: Request) {
  const startedAt = Date.now();

  try {
    const { lat, lng } = await req.json();
    // Log the request coordinates for the grid scan
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    // 1. INCREASE DENSITY: 10x10 grid (100 probes)
    // 2. INCREASE SPREAD: use degrees around center.
    // Previously this used `3.0` degrees which is ~333km and too large.
    // Use ~0.015 degrees (~1.5 km) to probe locally around the target.
    const points: { lat: number; lng: number }[] = [];
    const spread = 0.015; // ~1.5 km
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
          // Log each probe's coordinates (may be many)
          // console.log(`Solar probe coordinates: lat=${p.lat}, lng=${p.lng}`);
          // Google findClosest looks for the nearest processed building
          // Use GET with query params (matches browser test that returned JSON)
          const url = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${p.lat}&location.longitude=${p.lng}&requiredQuality=BASE&experiments=EXPANDED_COVERAGE&key=${API_KEY}`;
          const res = await fetch(url);

          if (!res.ok) {
            const text = await res.text();
            // Detailed error body omitted; uncomment to inspect when necessary
            // console.error(`Solar API HTTP ${res.status} for probe (${p.lat}, ${p.lng}):`, text.slice(0, 2000));
            console.log(`Solar API HTTP ${res.status} for probe (${p.lat}, ${p.lng})`);
            return null;
          }

          let data: any;
          try {
            data = await res.json();
          } catch (e) {
            const text = await res.text();
            // console.error(`Solar API returned non-JSON for probe (${p.lat}, ${p.lng}):`, text.slice(0, 2000));
            console.log(`Solar API returned non-JSON for probe (${p.lat}, ${p.lng})`);
            return null;
          }

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

    
    // try {
    //   const sample = finalRealData.slice(0, 50); // limit output
    //   console.log("Deep Scan results (sample up to 50):", JSON.stringify(sample, null, 2));
    // } catch (e) {
    //   console.log("Deep Scan results: (could not stringify results)");
    // }
    logApiMetric({
      route: "/api/solar-grid",
      status: 200,
      success: true,
      durationMs: Date.now() - startedAt,
      extra: { pointCount: finalRealData.length },
    });

    return NextResponse.json(finalRealData);

  } catch (error: any) {
    logApiMetric({
      route: "/api/solar-grid",
      status: 500,
      success: false,
      durationMs: Date.now() - startedAt,
      extra: { error: error?.message || "unknown" },
    });
    return NextResponse.json([]);
  }
}