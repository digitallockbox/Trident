/**
 * Oracle — Predictive Analytics Engine
 *
 * Performs trend analysis, forecasting, and probability estimation
 * on numeric time-series data using linear regression and moving averages.
 */
export class Oracle {
  private series: Map<string, Array<{ value: number; timestamp: number }>> = new Map();

  async execute(data: Record<string, any>): Promise<Record<string, any>> {
    const action = data.action || 'forecast';

    switch (action) {
      case 'ingest':
        return this.ingest(data);
      case 'forecast':
        return this.forecast(data);
      case 'trend':
        return this.trendAnalysis(data);
      case 'probability':
        return this.probability(data);
      default:
        return { status: 'error', engine: 'Oracle', error: `Unknown action: ${action}` };
    }
  }

  private ingest(data: Record<string, any>): Record<string, any> {
    const seriesName = data.series as string;
    if (!seriesName) return { status: 'error', engine: 'Oracle', error: 'Missing series name' };

    const points = Array.isArray(data.points) ? data.points : [];
    if (!this.series.has(seriesName)) this.series.set(seriesName, []);
    const arr = this.series.get(seriesName)!;

    let ingested = 0;
    for (const p of points) {
      if (typeof p.value === 'number' && isFinite(p.value)) {
        arr.push({ value: p.value, timestamp: p.timestamp || Date.now() });
        ingested++;
      }
    }
    // Cap at 2000 points
    while (arr.length > 2000) arr.shift();

    return { status: 'success', engine: 'Oracle', series: seriesName, ingested, total: arr.length };
  }

  private forecast(data: Record<string, any>): Record<string, any> {
    const seriesName = data.series as string;
    const steps = Math.min(Number(data.steps) || 5, 50);
    const arr = this.series.get(seriesName);

    if (!arr || arr.length < 3) {
      return { status: 'success', engine: 'Oracle', forecast: [], message: 'Insufficient data (need >= 3 points)' };
    }

    // Linear regression on indices
    const n = arr.length;
    const values = arr.map(p => p.value);
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const forecast: Array<{ step: number; predicted: number }> = [];
    for (let s = 1; s <= steps; s++) {
      forecast.push({
        step: s,
        predicted: Math.round((slope * (n - 1 + s) + intercept) * 100) / 100,
      });
    }

    return {
      status: 'success',
      engine: 'Oracle',
      series: seriesName,
      model: { slope: Math.round(slope * 10000) / 10000, intercept: Math.round(intercept * 100) / 100 },
      forecast,
    };
  }

  private trendAnalysis(data: Record<string, any>): Record<string, any> {
    const seriesName = data.series as string;
    const windowSize = Math.min(Number(data.window) || 10, 100);
    const arr = this.series.get(seriesName);

    if (!arr || arr.length < windowSize) {
      return { status: 'success', engine: 'Oracle', trend: 'unknown', message: 'Insufficient data' };
    }

    const recent = arr.slice(-windowSize).map(p => p.value);
    const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
    const secondHalf = recent.slice(Math.floor(recent.length / 2));
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const change = avgSecond - avgFirst;
    const pctChange = avgFirst !== 0 ? (change / Math.abs(avgFirst)) * 100 : 0;

    let trend: string;
    if (pctChange > 5) trend = 'rising';
    else if (pctChange < -5) trend = 'falling';
    else trend = 'stable';

    return {
      status: 'success',
      engine: 'Oracle',
      series: seriesName,
      trend,
      percentChange: Math.round(pctChange * 100) / 100,
      window: windowSize,
    };
  }

  private probability(data: Record<string, any>): Record<string, any> {
    const seriesName = data.series as string;
    const threshold = Number(data.threshold);
    if (!seriesName || !isFinite(threshold)) {
      return { status: 'error', engine: 'Oracle', error: 'Missing series or threshold' };
    }

    const arr = this.series.get(seriesName);
    if (!arr || arr.length < 2) {
      return { status: 'success', engine: 'Oracle', probability: 0, message: 'Insufficient data' };
    }

    const values = arr.map(p => p.value);
    const above = values.filter(v => v >= threshold).length;
    const prob = Math.round((above / values.length) * 10000) / 10000;

    return {
      status: 'success',
      engine: 'Oracle',
      series: seriesName,
      threshold,
      probability: prob,
      sampleSize: values.length,
    };
  }
}
