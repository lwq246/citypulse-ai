type ApiMetricPayload = {
  route: string;
  method?: string;
  status: number;
  success: boolean;
  durationMs: number;
  extra?: Record<string, unknown>;
};

export function logApiMetric(payload: ApiMetricPayload) {
  const severity = payload.success ? "INFO" : "ERROR";

  console.log(
    JSON.stringify({
      severity,
      metricType: "api_kpi",
      route: payload.route,
      method: payload.method || "POST",
      status: payload.status,
      success: payload.success,
      durationMs: payload.durationMs,
      ...payload.extra,
      ts: new Date().toISOString(),
    }),
  );
}
