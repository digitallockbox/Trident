/**
 * Helix — Pattern Analysis Engine
 *
 * Detects recurring patterns, sequences, and correlations in data.
 * Identifies periodicity and common subsequences.
 */
export class Helix {
  private patterns: Map<string, Array<{ sequence: string[]; count: number; lastSeen: string }>> = new Map();

  async execute(data: Record<string, any>): Promise<Record<string, any>> {
    const action = data.action || 'detect';

    switch (action) {
      case 'detect':
        return this.detectPatterns(data);
      case 'correlate':
        return this.correlate(data);
      case 'sequence':
        return this.findSequences(data);
      default:
        return { status: 'error', engine: 'Helix', error: `Unknown action: ${action}` };
    }
  }

  private detectPatterns(data: Record<string, any>): Record<string, any> {
    const events = Array.isArray(data.events) ? data.events.map(String) : [];
    if (events.length < 2) {
      return { status: 'success', engine: 'Helix', patterns: [], message: 'Need at least 2 events' };
    }

    // Find recurring subsequences of length 2-5
    const freq: Record<string, number> = {};
    for (let len = 2; len <= Math.min(5, events.length); len++) {
      for (let i = 0; i <= events.length - len; i++) {
        const sub = events.slice(i, i + len).join(' -> ');
        freq[sub] = (freq[sub] || 0) + 1;
      }
    }

    const recurring = Object.entries(freq)
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([pattern, count]) => ({ pattern, count }));

    return {
      status: 'success',
      engine: 'Helix',
      totalEvents: events.length,
      recurringPatterns: recurring,
      detectedAt: new Date().toISOString(),
    };
  }

  private correlate(data: Record<string, any>): Record<string, any> {
    const seriesA = Array.isArray(data.seriesA) ? data.seriesA.filter((v: any) => typeof v === 'number') as number[] : [];
    const seriesB = Array.isArray(data.seriesB) ? data.seriesB.filter((v: any) => typeof v === 'number') as number[] : [];
    const n = Math.min(seriesA.length, seriesB.length);

    if (n < 3) {
      return { status: 'success', engine: 'Helix', correlation: null, message: 'Need at least 3 paired values' };
    }

    const a = seriesA.slice(0, n);
    const b = seriesB.slice(0, n);
    const meanA = a.reduce((s, v) => s + v, 0) / n;
    const meanB = b.reduce((s, v) => s + v, 0) / n;

    let cov = 0, varA = 0, varB = 0;
    for (let i = 0; i < n; i++) {
      const da = a[i] - meanA;
      const db = b[i] - meanB;
      cov += da * db;
      varA += da * da;
      varB += db * db;
    }

    const denom = Math.sqrt(varA * varB);
    const r = denom > 0 ? cov / denom : 0;
    let strength: string;
    const absR = Math.abs(r);
    if (absR > 0.8) strength = 'strong';
    else if (absR > 0.5) strength = 'moderate';
    else if (absR > 0.2) strength = 'weak';
    else strength = 'negligible';

    return {
      status: 'success',
      engine: 'Helix',
      correlation: Math.round(r * 10000) / 10000,
      strength,
      direction: r > 0 ? 'positive' : r < 0 ? 'negative' : 'none',
      samples: n,
    };
  }

  private findSequences(data: Record<string, any>): Record<string, any> {
    const values = Array.isArray(data.values) ? data.values.filter((v: any) => typeof v === 'number') as number[] : [];
    if (values.length < 4) {
      return { status: 'success', engine: 'Helix', sequences: [], message: 'Need at least 4 values' };
    }

    // Detect monotonic subsequences
    const sequences: Array<{ type: string; start: number; length: number; values: number[] }> = [];
    let i = 0;
    while (i < values.length - 1) {
      const increasing = values[i + 1] >= values[i];
      let j = i + 1;
      while (j < values.length && (increasing ? values[j] >= values[j - 1] : values[j] <= values[j - 1])) {
        j++;
      }
      if (j - i >= 3) {
        sequences.push({
          type: increasing ? 'ascending' : 'descending',
          start: i,
          length: j - i,
          values: values.slice(i, j),
        });
      }
      i = j;
    }

    return {
      status: 'success',
      engine: 'Helix',
      totalValues: values.length,
      sequences: sequences.slice(0, 20),
    };
  }
}
