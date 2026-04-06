/**
 * Fusion — Data Merging Engine
 *
 * Combines, deduplicates, and reconciles data from multiple sources
 * into a unified output. Supports merge, diff, and union operations.
 */
export class Fusion {
  async execute(data: Record<string, any>): Promise<Record<string, any>> {
    const action = data.action || 'merge';

    switch (action) {
      case 'merge':
        return this.merge(data);
      case 'diff':
        return this.diff(data);
      case 'deduplicate':
        return this.deduplicate(data);
      case 'union':
        return this.union(data);
      default:
        return { status: 'error', engine: 'Fusion', error: `Unknown action: ${action}` };
    }
  }

  private merge(data: Record<string, any>): Record<string, any> {
    const sources = Array.isArray(data.sources) ? data.sources : [];
    const key = data.key as string;

    if (sources.length < 2 || !key) {
      return { status: 'error', engine: 'Fusion', error: 'Need at least 2 sources and a key field' };
    }

    const merged: Map<string, Record<string, any>> = new Map();
    let totalRecords = 0;

    for (const source of sources) {
      const rows = Array.isArray(source) ? source : [];
      totalRecords += rows.length;
      for (const row of rows) {
        const k = String(row[key] ?? '');
        if (!k) continue;
        const existing = merged.get(k) || {};
        merged.set(k, { ...existing, ...row });
      }
    }

    const result = Array.from(merged.values());
    return {
      status: 'success',
      engine: 'Fusion',
      inputRecords: totalRecords,
      mergedRecords: result.length,
      key,
      result: result.slice(0, 1000),
    };
  }

  private diff(data: Record<string, any>): Record<string, any> {
    const sourceA = Array.isArray(data.sourceA) ? data.sourceA : [];
    const sourceB = Array.isArray(data.sourceB) ? data.sourceB : [];
    const key = data.key as string;

    if (!key) return { status: 'error', engine: 'Fusion', error: 'Missing key field' };

    const keysA = new Set(sourceA.map((r: any) => String(r[key] ?? '')));
    const keysB = new Set(sourceB.map((r: any) => String(r[key] ?? '')));

    const onlyA = sourceA.filter((r: any) => !keysB.has(String(r[key] ?? '')));
    const onlyB = sourceB.filter((r: any) => !keysA.has(String(r[key] ?? '')));
    const common = sourceA.filter((r: any) => keysB.has(String(r[key] ?? '')));

    return {
      status: 'success',
      engine: 'Fusion',
      onlyInA: onlyA.length,
      onlyInB: onlyB.length,
      common: common.length,
      samplesOnlyA: onlyA.slice(0, 10),
      samplesOnlyB: onlyB.slice(0, 10),
    };
  }

  private deduplicate(data: Record<string, any>): Record<string, any> {
    const rows = Array.isArray(data.rows) ? data.rows : [];
    const key = data.key as string;

    if (!key) return { status: 'error', engine: 'Fusion', error: 'Missing key field' };

    const seen = new Set<string>();
    const unique: Record<string, any>[] = [];
    let duplicates = 0;

    for (const row of rows) {
      const k = String(row[key] ?? '');
      if (seen.has(k)) {
        duplicates++;
      } else {
        seen.add(k);
        unique.push(row);
      }
    }

    return {
      status: 'success',
      engine: 'Fusion',
      original: rows.length,
      unique: unique.length,
      duplicatesRemoved: duplicates,
      result: unique.slice(0, 1000),
    };
  }

  private union(data: Record<string, any>): Record<string, any> {
    const sources = Array.isArray(data.sources) ? data.sources : [];
    const key = data.key as string;

    if (!key) return { status: 'error', engine: 'Fusion', error: 'Missing key field' };

    const seen = new Set<string>();
    const result: Record<string, any>[] = [];

    for (const source of sources) {
      const rows = Array.isArray(source) ? source : [];
      for (const row of rows) {
        const k = String(row[key] ?? '');
        if (!seen.has(k)) {
          seen.add(k);
          result.push(row);
        }
      }
    }

    return {
      status: 'success',
      engine: 'Fusion',
      totalSources: sources.length,
      unionSize: result.length,
      result: result.slice(0, 1000),
    };
  }
}
