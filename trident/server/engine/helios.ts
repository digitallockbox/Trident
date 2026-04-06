/**
 * Helios — Insight & Illumination Engine
 *
 * Generates summaries, highlights key findings,
 * and produces insight reports from raw data.
 */
export class Helios {
  async execute(data: Record<string, any>): Promise<Record<string, any>> {
    const action = data.action || 'illuminate';

    switch (action) {
      case 'illuminate':
        return this.illuminate(data);
      case 'highlight':
        return this.highlight(data);
      case 'summarize':
        return this.summarize(data);
      default:
        return { status: 'error', engine: 'Helios', error: `Unknown action: ${action}` };
    }
  }

  private illuminate(data: Record<string, any>): Record<string, any> {
    const dataset = Array.isArray(data.dataset) ? data.dataset : [];
    if (dataset.length === 0) {
      return { status: 'success', engine: 'Helios', insights: [], message: 'No data to illuminate' };
    }

    const fields = Object.keys(dataset[0]);
    const insights: Array<{ field: string; insight: string; value: any }> = [];

    for (const field of fields) {
      const values = dataset.map((r: any) => r[field]).filter((v: any) => v !== undefined && v !== null);
      const numericVals = values.filter((v: any) => typeof v === 'number' && isFinite(v)) as number[];

      if (numericVals.length > 0) {
        const min = Math.min(...numericVals);
        const max = Math.max(...numericVals);
        const avg = numericVals.reduce((a: number, b: number) => a + b, 0) / numericVals.length;
        const range = max - min;

        if (range === 0) {
          insights.push({ field, insight: 'constant', value: min });
        } else if (avg > max * 0.8) {
          insights.push({ field, insight: 'skewed-high', value: Math.round(avg * 100) / 100 });
        } else if (avg < max * 0.2) {
          insights.push({ field, insight: 'skewed-low', value: Math.round(avg * 100) / 100 });
        }

        // Outlier detection
        const stddev = Math.sqrt(numericVals.reduce((s, v) => s + (v - avg) ** 2, 0) / numericVals.length);
        const outliers = numericVals.filter(v => Math.abs(v - avg) > 2 * stddev);
        if (outliers.length > 0) {
          insights.push({ field, insight: 'has-outliers', value: outliers.length });
        }
      } else {
        // Categorical
        const unique = new Set(values.map(String));
        if (unique.size === 1) {
          insights.push({ field, insight: 'single-value', value: values[0] });
        } else if (unique.size === values.length) {
          insights.push({ field, insight: 'all-unique', value: unique.size });
        }
      }
    }

    return {
      status: 'success',
      engine: 'Helios',
      records: dataset.length,
      fields: fields.length,
      insights,
      illuminatedAt: new Date().toISOString(),
    };
  }

  private highlight(data: Record<string, any>): Record<string, any> {
    const values = Array.isArray(data.values) ? data.values.filter((v: any) => typeof v === 'number') as number[] : [];
    const topN = Math.min(Number(data.top) || 5, 50);

    if (values.length === 0) {
      return { status: 'success', engine: 'Helios', highlights: [] };
    }

    const sorted = [...values].sort((a, b) => b - a);
    return {
      status: 'success',
      engine: 'Helios',
      top: sorted.slice(0, topN),
      bottom: sorted.slice(-topN).reverse(),
      total: values.length,
    };
  }

  private summarize(data: Record<string, any>): Record<string, any> {
    const text = data.text as string;
    if (!text || typeof text !== 'string') {
      return { status: 'error', engine: 'Helios', error: 'Missing text to summarize' };
    }

    const words = text.split(/\s+/).filter(Boolean);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const wordFreq: Record<string, number> = {};
    for (const w of words) {
      const lower = w.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (lower.length > 3) wordFreq[lower] = (wordFreq[lower] || 0) + 1;
    }

    const topWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    return {
      status: 'success',
      engine: 'Helios',
      wordCount: words.length,
      sentenceCount: sentences.length,
      avgWordsPerSentence: sentences.length > 0 ? Math.round(words.length / sentences.length) : 0,
      topKeywords: topWords,
    };
  }
}
