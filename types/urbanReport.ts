/**
 * Type definitions for Urban Report generation
 */

export interface MetricData {
  label: string;
  value: number;
  unit: string;
  status: 'Excellent' | 'Good' | 'Moderate' | 'Poor' | 'Critical';
  description?: string;
}

export interface UrbanReportJSON {
  title: string;
  executive_summary: string;
  location_name: string;
  key_metrics: MetricData[];
  recommendations: string[];
  environmental_insights: string;
  generated_at: string;
}

export interface ReportGenerationRequest {
  lat: number;
  lng: number;
  locationName: string;
  walkabilityScore?: number;
  shadeScore?: number;
  aqi?: number;
  temp?: number;
  solarPotential?: string;
  floodRiskLevel?: string;
}

export interface ReportGenerationResponse {
  success: boolean;
  data?: UrbanReportJSON;
  error?: string;
}
