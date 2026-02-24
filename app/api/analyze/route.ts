// app/api/analyze/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { lat, lng, locationName } = await req.json();
    const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const streetViewBaseUrl = "https://maps.googleapis.com/maps/api/streetview";
    const streetViewMetaUrl = "https://maps.googleapis.com/maps/api/streetview/metadata";

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `
      Analyze this Street View image of ${locationName}. Act as an Urban Designer.
      Return ONLY a raw JSON object with these EXACT keys:
      "walkabilityScore": (number 1-100),
      "shadeScore": (number 1-100),
      "summary": (short observation about pavement and trees),
      "recommendation": (one specific design fix)
    `;

    const findStreetViewLocation = async () => {
      const radii = [0, 50, 100, 200, 400, 800, 1600,3200,6400]; // Start with the exact location, then expand outwards
      for (const radius of radii) {
        const metaUrl = `${streetViewMetaUrl}?location=${lat},${lng}&radius=${radius}&source=outdoor&key=${MAPS_KEY}`;
        const metaResp = await fetch(metaUrl);
        const meta = await metaResp.json();
        if (meta.status === "OK" && meta.location) {
          return { lat: meta.location.lat, lng: meta.location.lng };
        }
      }
      return null;
    };

    const streetViewLocation = await findStreetViewLocation();
    if (!streetViewLocation) {
      return NextResponse.json({ error: "No Street View imagery found" }, { status: 404 });
    }

    const streetViewUrl = `${streetViewBaseUrl}?size=600x400&location=${streetViewLocation.lat},${streetViewLocation.lng}&fov=90&key=${MAPS_KEY}`;

    const imageResp = await fetch(streetViewUrl);
    const buffer = await imageResp.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
    ]);

    const text = result.response.text();
    // Regex to extract JSON even if Gemini adds conversational text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const data = JSON.parse(jsonMatch ? jsonMatch[0] : text);

    return NextResponse.json({
      walkabilityScore: data.walkabilityScore || data.walkability_score || 20,
      shadeScore: data.shadeScore || data.shade_score || 20,
      summary: data.summary || data.analysis || "No summary provided by AI.",
      recommendation: data.recommendation || data.suggested_fix || "No recommendation provided."
    });

  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}