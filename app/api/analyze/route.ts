// app/api/analyze/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { lat, lng, locationName } = await req.json();
    const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${lat},${lng}&fov=90&key=${MAPS_KEY}`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `
      Analyze this Street View image of ${locationName}. Act as an Urban Designer.
      Return ONLY a raw JSON object with these EXACT keys:
      "walkabilityScore": (number 1-100),
      "shadeScore": (number 1-100),
      "summary": (short observation about pavement and trees),
      "recommendation": (one specific design fix)
    `;

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