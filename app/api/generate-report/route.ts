import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import type {
  ReportGenerationRequest,
  ReportGenerationResponse,
  UrbanReportJSON,
} from '@/types/urbanReport';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(
  req: Request,
): Promise<NextResponse<ReportGenerationResponse>> {
  try {
    const body = (await req.json()) as ReportGenerationRequest;

    if (!body.locationName) {
      return NextResponse.json(
        { success: false, error: 'Location name is required' },
        { status: 400 },
      );
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json', // This ensures it ONLY outputs valid JSON
      },
    });

    const prompt = `
You are an expert urban planner. Generate a structured JSON urban sustainability report.
LOCATION: ${body.locationName}
DATA: Walkability: ${body.walkabilityScore}/100 | Shade: ${body.shadeScore}/100 | AQI: ${body.aqi} | Temp: ${body.temp}°C | Solar: ${body.solarPotential} | Flood Risk: ${body.floodRiskLevel}

Follow this EXACT JSON schema:
{
  "title": "Urban Report: [Location Name]",
  "executive_summary": "2-3 sentence summary...",
  "location_name": "${body.locationName}",
  "key_metrics": [
    {
      "label": "Metric Name",
      "value": 85,
      "unit": "%",
      "status": "Excellent" | "Good" | "Moderate" | "Poor" | "Critical",
      "description": "Brief description"
    }
  ],
  "recommendations": ["Specific actionable recommendation 1", "Rec 2", "Rec 3"],
  "environmental_insights": "3-4 sentence comprehensive analysis...",
  "generated_at": "${new Date().toISOString()}"
}
`;

    const result = await model.generateContent(prompt);
    const reportData: UrbanReportJSON = JSON.parse(result.response.text());
    reportData.generated_at = new Date().toISOString();

    return NextResponse.json({ success: true, data: reportData });
  } catch (error: any) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to synthesize AI report. Please try again.',
      },
      { status: 500 },
    );
  }
}
