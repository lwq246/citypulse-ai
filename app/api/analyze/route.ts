// app/api/analyze/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { logApiMetric } from "@/utils/serverMetrics";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  const startedAt = Date.now();

  try {
    const { lat, lng, locationName } = await req.json();

    const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!MAPS_KEY) {
      console.error("Missing Google Maps API key");
      logApiMetric({
        route: "/api/analyze",
        status: 500,
        success: false,
        durationMs: Date.now() - startedAt,
        extra: { reason: "missing_maps_key" },
      });
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

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

    // Function to find a Street View location
    const findStreetViewLocation = async () => {
      const radii = [0, 50, 100, 200, 400, 800, 1600, 3200, 6400];
      for (const radius of radii) {
        const metaUrl = `${streetViewMetaUrl}?location=${lat},${lng}&radius=${radius}&source=outdoor&key=${MAPS_KEY}`;
        try {
          const metaResp = await fetch(metaUrl);
          if (!metaResp.ok) {
            console.warn(`Street View metadata fetch failed for radius ${radius}`);
            continue;
          }
          const meta = await metaResp.json();
          if (meta.status === "OK" && meta.location) {
            return { lat: meta.location.lat, lng: meta.location.lng };
          }
        } catch (err) {
          console.error("Error fetching Street View metadata:", err);
        }
      }
      return null;
    };

    const streetViewLocation = await findStreetViewLocation();
    if (!streetViewLocation) {
      console.warn("No Street View imagery found");
      logApiMetric({
        route: "/api/analyze",
        status: 404,
        success: false,
        durationMs: Date.now() - startedAt,
        extra: { reason: "street_view_not_found" },
      });
      return NextResponse.json({ error: "No Street View imagery found" }, { status: 404 });
    }

    // Fetch the image
    const streetViewUrl = `${streetViewBaseUrl}?size=600x400&location=${streetViewLocation.lat},${streetViewLocation.lng}&fov=90&key=${MAPS_KEY}`;
    let base64Image = "";
    try {
      const imageResp = await fetch(streetViewUrl);
      if (!imageResp.ok) {
        console.error("Failed to fetch Street View image");
        logApiMetric({
          route: "/api/analyze",
          status: 500,
          success: false,
          durationMs: Date.now() - startedAt,
          extra: { reason: "street_view_image_fetch_failed" },
        });
        return NextResponse.json({ error: "Failed to fetch Street View image" }, { status: 500 });
      }
      const buffer = await imageResp.arrayBuffer();
      base64Image = Buffer.from(buffer).toString("base64");
    } catch (err) {
      console.error("Error fetching Street View image:", err);
      logApiMetric({
        route: "/api/analyze",
        status: 500,
        success: false,
        durationMs: Date.now() - startedAt,
        extra: { reason: "street_view_image_exception" },
      });
      return NextResponse.json({ error: "Failed to fetch Street View image" }, { status: 500 });
    }

    // Call Gemini API
    let aiResponseText = "";
    try {
      const result = await model.generateContent([
        prompt,
        { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
      ]);
      aiResponseText = result.response.text();
    } catch (err) {
      console.error("Error calling Gemini API:", err);
      logApiMetric({
        route: "/api/analyze",
        status: 500,
        success: false,
        durationMs: Date.now() - startedAt,
        extra: { reason: "gemini_failed" },
      });
      return NextResponse.json({ error: "AI model failed" }, { status: 500 });
    }

    // Parse AI response safely
    let data: any = {};
    try {
      const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
      data = JSON.parse(jsonMatch ? jsonMatch[0] : "{}");
    } catch (err) {
      console.error("Failed to parse AI response:", aiResponseText, err);
      logApiMetric({
        route: "/api/analyze",
        status: 500,
        success: false,
        durationMs: Date.now() - startedAt,
        extra: { reason: "invalid_ai_json" },
      });
      return NextResponse.json({ error: "Invalid AI response" }, { status: 500 });
    }

    // Return final JSON with fallbacks
    logApiMetric({
      route: "/api/analyze",
      status: 200,
      success: true,
      durationMs: Date.now() - startedAt,
      extra: { locationName },
    });

    return NextResponse.json({
      walkabilityScore: data.walkabilityScore ?? data.walkability_score ?? 20,
      shadeScore: data.shadeScore ?? data.shade_score ?? 20,
      summary: data.summary ?? data.analysis ?? "No summary provided by AI.",
      recommendation: data.recommendation ?? data.suggested_fix ?? "No recommendation provided."
    });

  } catch (error) {
    console.error("Unexpected error in /analyze route:", error);
    logApiMetric({
      route: "/api/analyze",
      status: 500,
      success: false,
      durationMs: Date.now() - startedAt,
      extra: { reason: "unexpected_error" },
    });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}