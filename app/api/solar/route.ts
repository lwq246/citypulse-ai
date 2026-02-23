import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { lat, lng } = await req.json();
    // Log the requested coordinates for debugging (lat, lng)
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    // Use GET with query parameters (matches successful browser request)
    const url = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&requiredQuality=BASE&experiments=EXPANDED_COVERAGE&key=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      // Omit verbose HTML body; log concise status and return a conservative fallback
      console.log(`Solar API HTTP ${response.status} for (${lat}, ${lng}) — no data.`);
      return NextResponse.json({ area: 0, savings: 0, potential: "Data Pending", source: "Google Solar API (Unavailable)" });
    }

    let data: any;
    try {
      data = await response.json();
    } catch (parseErr) {
      console.log(`Solar API returned non-JSON for (${lat}, ${lng})`);
      return NextResponse.json({ area: 0, savings: 0, potential: "Data Pending", source: "Google Solar API (Unavailable)" });
    }

    console.log(`Solar API request for (${lat}, ${lng}) returned:`, JSON.stringify(data?.solarPotential ? { area: data.solarPotential.wholeRoofStats?.areaMeters2, name: data.name } : data));

    if (data && data.solarPotential) {
      const potential = data.solarPotential;
      const area = Math.round(potential.wholeRoofStats.areaMeters2 || 0);
      // Logic: Area * 4 hours sunlight * 15% efficiency * 365 days * RM 0.50 rate
      const savings = Math.round(area * 4 * 0.15 * 365 * 0.5);

      return NextResponse.json({
        area,
        savings,
        potential: "Excellent",
        source: "Google Solar API"
      });
    }

    // No real data found, return mock-derived estimate
    console.log(`Solar API returned no solarPotential for (${lat}, ${lng})`);
    return NextResponse.json({ area: 0, savings: 0, potential: "Data Pending", source: "Google Solar API (No Potential)" });

  } catch (error) {
    console.log(`Solar API exception occurred:`, String(error));
    return NextResponse.json({ area: 0, savings: 0, potential: "Data Pending", source: "Solar API Exception" });
  }
}