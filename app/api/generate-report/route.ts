import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import type {
  ReportGenerationRequest,
  ReportGenerationResponse,
  UrbanReportJSON,
} from '@/types/urbanReport';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Helper to fetch Google Maps imagery and convert to Base64 for Gemini
async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer).toString('base64');
  } catch (error) {
    console.error('Image fetch error:', error);
    return null;
  }
}

export async function POST(
  req: Request,
): Promise<NextResponse<ReportGenerationResponse>> {
  try {
    const body = (await req.json()) as ReportGenerationRequest;

    if (!body.locationName || !body.lat || !body.lng) {
      return NextResponse.json(
        { success: false, error: 'Location name and coordinates are required' },
        { status: 400 },
      );
    }

    // 1. FETCH SATELLITE & STREET VIEW IMAGERY
    const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
    const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${body.lat},${body.lng}&fov=90&heading=235&pitch=10&key=${mapsApiKey}`;
    const satelliteUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${body.lat},${body.lng}&zoom=18&size=600x400&maptype=satellite&key=${mapsApiKey}`;

    const [streetViewBase64, satelliteBase64] = await Promise.all([
      fetchImageAsBase64(streetViewUrl),
      fetchImageAsBase64(satelliteUrl),
    ]);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    // 2. CONSTRUCT THE MULTIMODAL PROMPT WITH FEW-SHOT EXAMPLES
    const prompt = `
You are an expert urban planner and environmental analyst. 
I am providing you with two images for a location in Malaysia (${body.locationName}):
1. A top-down Satellite View
2. A ground-level Street View

Analyze these images alongside the baseline sensor data provided to calculate accurate urban metrics and generate a comprehensive report.

BASELINE SENSOR DATA:
- Initial Walkability Estimate: ${body.walkabilityScore}/100
- Initial Shade/Canopy Estimate: ${body.shadeScore}/100
- Air Quality Index (AQI): ${body.aqi}
- Temperature: ${body.temp}°C
- Solar Potential: ${body.solarPotential}
- Flood Risk Level: ${body.floodRiskLevel}

--- FEW-SHOT SCORING EXAMPLES (ACTUAL SAMPLES) ---

WALKABILITY INDEX SCORING EXAMPLES (Visual Analysis):

EXAMPLE 1 - HIGH WALKABILITY (Score: 88/100 - Excellent)
Visual Cues: Wide sidewalks (3m+), clear pedestrian crossings with markings, separated from vehicle lanes by planters, mature trees, shops at ground level, low traffic speed
Location Type: Mixed-use urban district (e.g., Bukit Bintang area)
Reasoning: "The street view clearly shows dedicated pedestrian space, traffic calming, and active ground-floor uses. Excellent walkability."

EXAMPLE 2 - MODERATE WALKABILITY (Score: 55/100 - Moderate)
Visual Cues: Narrow sidewalks (1-1.5m), pedestrians walking close to traffic, some obstructions (poles, vendor stands), occasional trees
Location Type: Secondary residential road
Reasoning: "Pedestrian infrastructure exists but is constrained. Functional but not comfortable. Moderate score."

EXAMPLE 3 - CRITICAL WALKABILITY (Score: 22/100 - Critical)
Visual Cues: No visible sidewalk, high-speed road (highway), concrete barrier, no pedestrian crossing, barren vegetation
Location Type: Highway or industrial area
Reasoning: "No pedestrian infrastructure. Extremely hostile environment. Critical score."

SHADE COVERAGE SCORING EXAMPLES (Visual Analysis):

EXAMPLE 1 - EXCELLENT COVERAGE (Score: 89% - Excellent)
Satellite View: Dense tree canopy creating continuous dark shadows over streets and sidewalks
Street View: Large mature trees with wide spreading branches casting dappled shadows on pedestrian areas, street feels cool and shaded
Location Type: Tree-lined avenue or park-adjacent area (e.g., KLCC Park surroundings)
Reasoning: "Satellite confirms dense canopy creating pervasive shadows. Street view shows pedestrians walking in significant shade. Excellent for comfort and cooling."

EXAMPLE 2 - MODERATE COVERAGE (Score: 54% - Moderate)
Satellite View: Scattered tree cover with mixed shadows and sunny patches
Street View: Mix of shaded areas from trees and open sun exposure, pedestrians experience intermittent shade
Location Type: Mixed commercial-residential with some vegetation
Reasoning: "Some tree cover visible creating partial shade. Street alternates between shaded and exposed areas. Moderate comfort level."

EXAMPLE 3 - CRITICAL COVERAGE (Score: 16% - Critical)
Satellite View: Minimal tree canopy, predominantly clear streets with few shadows
Street View: Minimal trees, completely exposed asphalt/concrete to direct sunlight, street feels hot and bright
Location Type: Industrial zone, new development, or heavily paved area
Reasoning: "Satellite shows almost no shade-creating trees. Street view confirms intense sun exposure with minimal relief. Critical lack of pedestrian comfort."

SOLAR POTENTIAL SCORING EXAMPLES (Visual Analysis):

EXAMPLE 1 - EXCELLENT POTENTIAL (Score: 92/100 - Excellent)
Satellite View: Clear building rooftops with no obstructions, few trees, minimal cloud cover typical
Street View: Tall buildings with south-facing roofs, open air space, minimal shadow patterns
Location Type: Commercial district or high-rise area
Reasoning: "Satellite shows extensive unshaded roof area. Street view confirms minimal tree cover and good sun exposure. Excellent solar potential."

EXAMPLE 2 - MODERATE POTENTIAL (Score: 58/100 - Moderate)
Satellite View: Mix of buildings and trees, some roofs shaded by adjacent structures
Street View: Medium-height buildings with partial shade from trees, scattered solar exposure
Location Type: Mixed residential-commercial
Reasoning: "Some suitable rooftop area but significant shading from vegetation and adjacent buildings. Moderate potential."

EXAMPLE 3 - CRITICAL POTENTIAL (Score: 25/100 - Critical)
Satellite View: Dense tree canopy covering most buildings, narrow streets with tall buildings blocking sun
Street View: Heavy shade from mature trees and tall structures, very limited direct sunlight
Location Type: Dense historical district or dense forest area
Reasoning: "Satellite shows pervasive tree cover and building shadows. Street view confirms minimal sun exposure. Critical potential."

FLOOD RISK LEVEL SCORING EXAMPLES (Visual Analysis):

EXAMPLE 1 - EXCELLENT (LOW RISK, Score: 95/100 - Excellent)
Satellite View: Located on elevated terrain, visible drainage systems, distance from water bodies
Street View: High ground level, proper drainage infrastructure, no flooding indicators
Location Type: Hilltop or elevated residential area
Reasoning: "Satellite confirms elevated location away from flood-prone areas. Street view shows good drainage. Low risk."

EXAMPLE 2 - MODERATE RISK (Score: 55/100 - Moderate)
Satellite View: Near water body at moderate distance, some low-lying areas visible
Street View: Ground level relatively normal, but drainage could be improved, some water marks visible
Location Type: Near river or prone to seasonal flooding
Reasoning: "Proximity to water body visible in satellite. Street view shows moderate elevation. Seasonal flooding possible."

EXAMPLE 3 - CRITICAL (HIGH RISK, Score: 18/100 - Critical)
Satellite View: Adjacent to large water body or in clear floodplain, very low elevation
Street View: Ground level extremely low, visible water damage on buildings, poor drainage
Location Type: Floodplain area or near major river
Reasoning: "Satellite shows clear flood risk from proximity to water. Street view confirms low elevation and water damage. Critical risk."

--- APPLICATION GUIDELINES ---
1. Use the satellite image to identify large-scale green coverage patterns
2. Use street view to assess shade comfort and pedestrian experience
3. Adjust the baseline estimate UP if images show better conditions than the sensor suggests
4. Adjust the baseline estimate DOWN if images show worse conditions than the sensor suggests
5. Provide specific visual evidence in descriptions (e.g., "Mature trees observed in satellite" or "No sidewalk visible")
------------------------------------

Based on your visual analysis of the images compared to these scoring examples, output the final report matching this EXACT JSON schema:
{
  "title": "Urban Intelligence Briefing: [Location Name]",
  "executive_summary": "2-3 sentence summary heavily incorporating what you visually observed in the imagery.",
  "location_name": "${body.locationName}",
  "key_metrics": [
    {
      "label": "Walkability Index",
      "value": <Your recalculated number based on visual evidence (compare to examples above)>,
      "unit": "/100",
      "status": "Excellent" | "Good" | "Moderate" | "Poor" | "Critical",
      "description": "Brief description mentioning specific visual evidence (e.g., 'Lack of sidewalks visible on street level')"
    },
    {
      "label": "Shade Coverage",
      "value": <Your recalculated number based on visual evidence (compare to examples above)>,
      "unit": "%",
      "status": "Excellent" | "Good" | "Moderate" | "Poor" | "Critical",
      "description": "Brief description of pedestrian shade availability (e.g., 'Dense tree shadows observed providing significant pedestrian comfort')"
    },
    {
      "label": "Air Quality",
      "value": ${body.aqi},
      "unit": "AQI",
      "status": "Excellent" | "Good" | "Moderate" | "Poor" | "Critical",
      "description": "Brief description based on AQI reading"
    },
    {
      "label": "Urban Heat Island Effect",
      "value": ${body.temp},
      "unit": "°C",
      "status": "Excellent" | "Good" | "Moderate" | "Poor" | "Critical",
      "description": "Temperature impact analysis combined with observed lack/presence of shade"
    },
    {
      "label": "Solar Potential",
      "value": <Your recalculated number based on visual evidence (compare to examples above)>,
      "unit": "/100",
      "status": "Excellent" | "Good" | "Moderate" | "Poor" | "Critical",
      "description": "Assessment of solar energy generation potential based on roof exposure and sunlight"
    },
    {
      "label": "Flood Risk Level",
      "value": <Your recalculated number based on visual evidence (compare to examples above)>,
      "unit": "/100",
      "status": "Excellent" | "Good" | "Moderate" | "Poor" | "Critical",
      "description": "Flood risk assessment based on elevation, proximity to water bodies, and drainage infrastructure"
    }
  ],
  "recommendations": [
    "Specific actionable recommendation 1 based on visual evidence",
    "Specific actionable recommendation 2 based on visual evidence",
    "Specific actionable recommendation 3 based on visual evidence",
    "Specific actionable recommendation 4 based on visual evidence"
  ],
  "environmental_insights": "3-4 sentence analysis linking the visual layout of the streets/buildings to the environmental sensor data."
}
`;

    // 3. PREPARE MULTIMODAL PAYLOAD
    const contentParts: any[] = [{ text: prompt }];

    // Inject images into the prompt if they successfully fetched
    if (satelliteBase64) {
      contentParts.push({
        inlineData: { data: satelliteBase64, mimeType: 'image/jpeg' },
      });
    }
    if (streetViewBase64) {
      contentParts.push({
        inlineData: { data: streetViewBase64, mimeType: 'image/jpeg' },
      });
    }

    const result = await model.generateContent(contentParts);
    const reportData: UrbanReportJSON = JSON.parse(result.response.text());
    reportData.generated_at = new Date().toISOString();

    reportData.images = {
      satellite: satelliteBase64
        ? `data:image/jpeg;base64,${satelliteBase64}`
        : undefined,
      streetView: streetViewBase64
        ? `data:image/jpeg;base64,${streetViewBase64}`
        : undefined,
    };

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
