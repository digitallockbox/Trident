/**
 * SentinelV2 — Anomaly Detection Engine
 *
 * Monitors metrics streams for anomalies using statistical deviation,
 * maintains a sliding window of observations, and flags outliers.
 */
export class SentinelV2 {
  private observations: Array<{ timestamp: string; metric: string; value: number }> = [];
  private alerts: Array<{ timestamp: string; metric: string; value: number; deviation: number; severity: string }> = [];
  private readonly windowSize = 200;
  private readonly deviationThreshold = 2.5;

  async execute(data: Record<string, any>): Promise<Record<string, any>> {
    const action = data.action || 'observe';

    switch (action) {
      case 'observe':
        return this.observe(data);
      case 'detect':
        return this.detect(data);
      case 'alerts':
        return this.getAlerts(data);
      case 'status':
        return this.getStatus();
      default:
        return { status: 'error', engine: 'SentinelV2', error: `Unknown action: ${action}` };
    }
  }

  private observe(data: Record<string, any>): Record<string, any> {
    const metrics = Array.isArray(data.metrics) ? data.metrics : [];
    const ingested: string[] = [];

    for (const m of metrics) {
      if (typeof m.metric === 'string' && typeof m.value === 'number' && isFinite(m.value)) {
        this.observations.push({
          timestamp: new Date().toISOString(),
          metric: m.metric,
          value: m.value,
        });
        ingested.push(m.metric);
      }
    }

    // Trim window
    while (this.observations.length > this.windowSize) {
      this.observations.shift();
    }

    return {
      status: 'success',
      engine: 'SentinelV2',
      ingested: ingested.length,
      windowSize: this.observations.length,
    };
  }

  private detect(data: Record<string, any>): Record<string, any> {
    const metric = data.metric as string | undefined;
    const values = this.observations
      .filter(o => !metric || o.metric === metric)
      .map(o => o.value);

    if (values.length < 5) {
      return {
        status: 'success',
        engine: 'SentinelV2',
        anomalies: [],
        message: 'Insufficient data for detection',
      };
    }

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
    const stddev = Math.sqrt(variance);

    const anomalies: Array<{ value: number; deviation: number; severity: string }> = [];

    for (const v of values) {
      const dev = stddev > 0 ? Math.abs(v - mean) / stddev : 0;
      if (dev > this.deviationThreshold) {
        const severity = dev > 4 ? 'critical' : dev > 3 ? 'high' : 'medium';
        anomalies.push({ value: v, deviation: Math.round(dev * 100) / 100, severity });

        this.alerts.push({
          timestamp: new Date().toISOString(),
          metric: metric || 'all',
          value: v,
          deviation: Math.round(dev * 100) / 100,
          severity,
        });
      }
    }

    if (this.alerts.length > 500) {
      this.alerts = this.alerts.slice(-500);
    }

    return {
      status: 'success',
      engine: 'SentinelV2',
      mean: Math.round(mean * 100) / 100,
      stddev: Math.round(stddev * 100) / 100,
      threshold: this.deviationThreshold,
      anomalies,
      detectedAt: new Date().toISOString(),
    };
  }

  private getAlerts(data: Record<string, any>): Record<string, any> {
    const limit = Math.min(Number(data.limit) || 50, 500);
    const severity = data.severity as string | undefined;
    let filtered = this.alerts;
    if (severity) {
      filtered = filtered.filter(a => a.severity === severity);
    }

    return {
      status: 'success',
      engine: 'SentinelV2',
      alerts: filtered.slice(-limit),
      total: filtered.length,
    };
  }

  private getStatus(): Record<string, any> {
    return {
      status: 'success',
      engine: 'SentinelV2',
      observations: this.observations.length,
      totalAlerts: this.alerts.length,
      recentAlerts: this.alerts.slice(-5),
      windowSize: this.windowSize,
      deviationThreshold: this.deviationThreshold,
      checkedAt: new Date().toISOString(),
    };
  }
}
