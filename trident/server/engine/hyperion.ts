/**
 * Hyperion — High-Speed Compute Engine
 *
 * Performs batch computations, matrix operations,
 * hash computations, and parallel numeric processing.
 */
export class Hyperion {
  private computeLog: Array<{ operation: string; inputSize: number; duration: number; timestamp: string }> = [];

  async execute(data: Record<string, any>): Promise<Record<string, any>> {
    const action = data.action || 'compute';

    switch (action) {
      case 'compute':
        return this.batchCompute(data);
      case 'hash':
        return this.hashCompute(data);
      case 'matrix':
        return this.matrixOp(data);
      case 'stats':
        return this.getStats();
      default:
        return { status: 'error', engine: 'Hyperion', error: `Unknown action: ${action}` };
    }
  }

  private batchCompute(data: Record<string, any>): Record<string, any> {
    const values = Array.isArray(data.values) ? data.values.filter((v: any) => typeof v === 'number') as number[] : [];
    const operation = (data.operation as string) || 'sum';
    const start = performance.now();

    let result: number;
    switch (operation) {
      case 'sum': result = values.reduce((a, b) => a + b, 0); break;
      case 'product': result = values.reduce((a, b) => a * b, values.length > 0 ? 1 : 0); break;
      case 'max': result = values.length > 0 ? Math.max(...values) : 0; break;
      case 'min': result = values.length > 0 ? Math.min(...values) : 0; break;
      case 'mean': result = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0; break;
      case 'variance': {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        result = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
        break;
      }
      default: result = 0;
    }

    const duration = Math.round((performance.now() - start) * 100) / 100;
    this.computeLog.push({ operation, inputSize: values.length, duration, timestamp: new Date().toISOString() });
    if (this.computeLog.length > 500) this.computeLog.shift();

    return {
      status: 'success',
      engine: 'Hyperion',
      operation,
      inputSize: values.length,
      result: Math.round(result * 100000) / 100000,
      durationMs: duration,
    };
  }

  private hashCompute(data: Record<string, any>): Record<string, any> {
    const input = String(data.input || '');
    const start = performance.now();

    // Simple FNV-1a hash
    let hash = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
      hash ^= input.charCodeAt(i);
      hash = (hash * 0x01000193) & 0xffffffff;
    }
    const hexHash = (hash >>> 0).toString(16).padStart(8, '0');

    const duration = Math.round((performance.now() - start) * 100) / 100;

    return {
      status: 'success',
      engine: 'Hyperion',
      input: input.length > 100 ? `${input.slice(0, 100)}...` : input,
      hash: hexHash,
      algorithm: 'fnv-1a-32',
      durationMs: duration,
    };
  }

  private matrixOp(data: Record<string, any>): Record<string, any> {
    const matrixA = data.matrixA as number[][];
    const matrixB = data.matrixB as number[][];
    const operation = (data.operation as string) || 'multiply';

    if (!Array.isArray(matrixA) || matrixA.length === 0) {
      return { status: 'error', engine: 'Hyperion', error: 'Missing or invalid matrixA' };
    }

    const start = performance.now();

    if (operation === 'transpose') {
      const rows = matrixA.length;
      const cols = matrixA[0]?.length || 0;
      const result: number[][] = [];
      for (let j = 0; j < cols; j++) {
        result[j] = [];
        for (let i = 0; i < rows; i++) {
          result[j][i] = matrixA[i][j] || 0;
        }
      }
      return {
        status: 'success',
        engine: 'Hyperion',
        operation: 'transpose',
        result,
        durationMs: Math.round((performance.now() - start) * 100) / 100,
      };
    }

    if (operation === 'multiply' && Array.isArray(matrixB)) {
      const rowsA = matrixA.length;
      const colsA = matrixA[0]?.length || 0;
      const colsB = matrixB[0]?.length || 0;

      if (colsA !== matrixB.length) {
        return { status: 'error', engine: 'Hyperion', error: 'Matrix dimensions incompatible for multiplication' };
      }

      const result: number[][] = [];
      for (let i = 0; i < rowsA; i++) {
        result[i] = [];
        for (let j = 0; j < colsB; j++) {
          let sum = 0;
          for (let k = 0; k < colsA; k++) {
            sum += (matrixA[i][k] || 0) * (matrixB[k]?.[j] || 0);
          }
          result[i][j] = Math.round(sum * 100000) / 100000;
        }
      }

      return {
        status: 'success',
        engine: 'Hyperion',
        operation: 'multiply',
        dimensions: `${rowsA}x${colsB}`,
        result,
        durationMs: Math.round((performance.now() - start) * 100) / 100,
      };
    }

    return { status: 'error', engine: 'Hyperion', error: `Unsupported matrix operation: ${operation}` };
  }

  private getStats(): Record<string, any> {
    const byOp: Record<string, { count: number; avgDuration: number }> = {};
    for (const entry of this.computeLog) {
      if (!byOp[entry.operation]) byOp[entry.operation] = { count: 0, avgDuration: 0 };
      byOp[entry.operation].count++;
      byOp[entry.operation].avgDuration += entry.duration;
    }
    for (const op of Object.values(byOp)) {
      op.avgDuration = Math.round((op.avgDuration / op.count) * 100) / 100;
    }

    return {
      status: 'success',
      engine: 'Hyperion',
      totalComputations: this.computeLog.length,
      operations: byOp,
    };
  }
}
