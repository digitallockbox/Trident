/**
 * Lumen — Insight & Analytics Engine
 *
 * Aggregates, summarizes, and visualizes data sets.
 * Provides descriptive statistics, grouping, and data clarity reports.
 */
export class Lumen {
  private datasets: Map<string, Array<Record<string, any>>> = new Map();

  async execute(data: Record<string, any>): Promise<Record<string, any>> {
    const action = data.action || 'analyze';

    switch (action) {
      case 'ingest':
        return this.ingest(data);
      case 'analyze':
        return this.analyze(data);
      case 'aggregate':
        return this.aggregate(data);
      case 'clarity':
        return this.clarityReport(data);
      default:
        return { status: 'error', engine: 'Lumen', error: `Unknown action: ${action}` };
    }
  }

  private ingest(data: Record<string, any>): Record<string, any> {
    const dataset = data.dataset as string;
    if (!dataset) return { status: 'error', engine: 'Lumen', error: 'Missing dataset name' };

    const rows = Array.isArray(data.rows) ? data.rows : [];
    if (!this.datasets.has(dataset)) this.datasets.set(dataset, []);
    const arr = this.datasets.get(dataset)!;
    arr.push(...rows.slice(0, 5000));
    while (arr.length > 10000) arr.shift();

    return { status: 'success', engine: 'Lumen', dataset, ingested: rows.length, total: arr.length };
  }

  private analyze(data: Record<string, any>): Record<string, any> {
    const dataset = data.dataset as string;
    const field = data.field as string;
    const arr = this.datasets.get(dataset);

    if (!arr || arr.length === 0) {
      return { status: 'success', engine: 'Lumen', analysis: null, message: 'No data available' };
    }
    if (!field) {
      // Return schema overview
      const sample = arr[0];
      const fields = Object.keys(sample);
      return {
        status: 'success',
        engine: 'Lumen',
        dataset,
        rows: arr.length,
        fields,
        sample: arr.slice(0, 3),
      };
    }

    const values = arr.map(r => r[field]).filter(v => v !== undefined && v !== null);
    const numericValues = values.filter(v => typeof v === 'number' && isFinite(v)) as number[];

    if (numericValues.length > 0) {
      const sorted = [...numericValues].sort((a, b) => a - b);
      const sum = sorted.reduce((a, b) => a + b, 0);
      return {
        status: 'success',
        engine: 'Lumen',
        dataset,
        field,
        type: 'numeric',
        count: numericValues.length,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        mean: Math.round((sum / sorted.length) * 100) / 100,
        median: sorted[Math.floor(sorted.length / 2)],
        sum: Math.round(sum * 100) / 100,
      };
    }

    // Categorical
    const counts: Record<string, number> = {};
    for (const v of values) {
      const key = String(v);
      counts[key] = (counts[key] || 0) + 1;
    }

    return {
      status: 'success',
      engine: 'Lumen',
      dataset,
      field,
      type: 'categorical',
      distinct: Object.keys(counts).length,
      distribution: counts,
    };
  }

  private aggregate(data: Record<string, any>): Record<string, any> {
    const dataset = data.dataset as string;
    const groupBy = data.groupBy as string;
    const metric = data.metric as string;
    const arr = this.datasets.get(dataset);

    if (!arr || !groupBy || !metric) {
      return { status: 'error', engine: 'Lumen', error: 'Missing dataset, groupBy, or metric' };
    }

    const groups: Record<string, number[]> = {};
    for (const row of arr) {
      const key = String(row[groupBy] ?? 'null');
      const val = Number(row[metric]);
      if (!isFinite(val)) continue;
      if (!groups[key]) groups[key] = [];
      groups[key].push(val);
    }

    const result: Record<string, { count: number; sum: number; avg: number }> = {};
    for (const [key, values] of Object.entries(groups)) {
      const sum = values.reduce((a, b) => a + b, 0);
      result[key] = {
        count: values.length,
        sum: Math.round(sum * 100) / 100,
        avg: Math.round((sum / values.length) * 100) / 100,
      };
    }

    return { status: 'success', engine: 'Lumen', dataset, groupBy, metric, groups: result };
  }

  private clarityReport(data: Record<string, any>): Record<string, any> {
    const dataset = data.dataset as string;
    const arr = this.datasets.get(dataset);
    if (!arr || arr.length === 0) {
      return { status: 'success', engine: 'Lumen', clarity: null, message: 'No data' };
    }

    const fields = Object.keys(arr[0]);
    const quality: Record<string, { populated: number; missing: number; fillRate: number }> = {};

    for (const field of fields) {
      let populated = 0;
      for (const row of arr) {
        if (row[field] !== undefined && row[field] !== null && row[field] !== '') populated++;
      }
      quality[field] = {
        populated,
        missing: arr.length - populated,
        fillRate: Math.round((populated / arr.length) * 10000) / 10000,
      };
    }

    return {
      status: 'success',
      engine: 'Lumen',
      dataset,
      totalRows: arr.length,
      totalFields: fields.length,
      quality,
      generatedAt: new Date().toISOString(),
    };
  }
}
