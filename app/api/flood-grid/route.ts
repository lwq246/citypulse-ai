// app/api/flood-grid/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { lat, lng } = await req.json();
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    const points: { lat: number; lng: number }[] = [];
    const spread = 0.015; // ~1.5km coverage
    const step = spread / 10;
    const jitter = step * 0.4;

    for (let i = -5; i < 5; i++) {
      for (let j = -5; j < 5; j++) {
        points.push({
          lat: lat + i * step + (Math.random() - 0.5) * jitter,
          lng: lng + j * step + (Math.random() - 0.5) * jitter,
        });
      }
    }

    const locations = points.map((p) => `${p.lat},${p.lng}`).join("|");
    const url = `https://maps.googleapis.com/maps/api/elevation/json?locations=${locations}&key=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") return NextResponse.json([]);

    // We pass the RAW elevation data. 
    // The MapBox logic will handle the 'pooling' calculation.
    return NextResponse.json(data.results.map((r: any) => ({
      lat: r.location.lat,
      lng: r.location.lng,
      elevation: r.elevation
    })));
  } catch (error) {
    return NextResponse.json([]);
  }
}