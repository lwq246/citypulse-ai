import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { lat, lng } = await req.json();
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    const points: { lat: number; lng: number }[] = [];
    const spread = 0.015; 
    const step = spread / 10; // 100 points for high precision

   
    const jitter = step * 0.4; // 40% of the step size as random shift

    for (let i = -5; i < 5; i++) {
    for (let j = -5; j < 5; j++) {
        points.push({
        // Adding Jitter here breaks the grid pattern
        lat: lat + (i * step) + (Math.random() - 0.5) * jitter,
        lng: lng + (j * step) + (Math.random() - 0.5) * jitter,
        });
    }
    }

    const locations = points.map((p) => `${p.lat},${p.lng}`).join("|");
    const url = `https://maps.googleapis.com/maps/api/elevation/json?locations=${locations}&key=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") return NextResponse.json([]);

    // We pass the RAW elevation. 
    // The MapBox will decide the color based on these real numbers.
    const realElevationPoints = data.results.map((r: any) => ({
      lat: r.location.lat,
      lng: r.location.lng,
      elevation: r.elevation // Pure ground truth
    }));

    return NextResponse.json(realElevationPoints);
  } catch (error) {
    return NextResponse.json([]);
  }
}