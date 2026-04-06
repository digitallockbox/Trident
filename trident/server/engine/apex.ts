/**
 * Apex — Peak Performance Engine
 *
 * Benchmarks operations, tracks throughput and latency metrics,
 * and identifies performance bottlenecks across the platform.
 */
export class Apex {
  private benchmarks: Array<{
    id: string;
    operation: string;
    duration: number;
    throughput: number;
    timestamp: string;
  }> = [];

  async execute(data: Record<string, any>): Promise<Record<string, any>> {
    const action = data.action || 'benchmark';

    switch (action) {
      case 'benchmark':
        return this.runBenchmark(data);
      case 'profile':
        return this.profileOperation(data);
      case 'metrics':
        return this.getMetrics();
      default:
        return { status: 'error', engine: 'Apex', error: `Unknown action: ${action}` };
    }
  }

  private runBenchmark(data: Record<string, any>): Record<string, any> {
    const operation = data.operation || 'default';
    const iterations = Math.min(Number(data.iterations) || 100, 10000);
    const start = performance.now();

    // Simulate workload — hash-like computation
    let result = 0;
    for (let i = 0; i < iterations; i++) {
      result = (result * 31 + i) & 0x7fffffff;
    }

    const duration = Math.round((performance.now() - start) * 100) / 100;
    const throughput = duration > 0 ? Math.round(iterations / (duration / 1000)) : iterations;

    const entry = {
      id: `BM-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      operation,
      duration,
      throughput,
      timestamp: new Date().toISOString(),
    };
    this.benchmarks.push(entry);
    if (this.benchmarks.length > 500) this.benchmarks.shift();

    return {
      status: 'success',
      engine: 'Apex',
      benchmark: entry,
      iterations,
    };
  }

  private profileOperation(data: Record<string, any>): Record<string, any> {
    const operation = data.operation as string || 'all';
    const relevant = this.benchmarks.filter(b =>
      operation === 'all' || b.operation === operation
    );

    if (relevant.length === 0) {
      return { status: 'success', engine: 'Apex', profile: null, message: 'No benchmarks found' };
    }

    const durations = relevant.map(b => b.duration);
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);
    const sorted = [...durations].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];

    return {
      status: 'success',
      engine: 'Apex',
      operation,
      profile: {
        samples: relevant.length,
        avgMs: Math.round(avg * 100) / 100,
        minMs: min,
        maxMs: max,
        p50Ms: p50,
        p95Ms: p95,
        p99Ms: p99,
      },
    };
  }

  private getMetrics(): Record<string, any> {
    const byOp: Record<string, number[]> = {};
    for (const b of this.benchmarks) {
      if (!byOp[b.operation]) byOp[b.operation] = [];
      byOp[b.operation].push(b.throughput);
    }

    const summary: Record<string, { samples: number; avgThroughput: number }> = {};
    for (const [op, values] of Object.entries(byOp)) {
      summary[op] = {
        samples: values.length,
        avgThroughput: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
      };
    }

    return {
      status: 'success',
      engine: 'Apex',
      totalBenchmarks: this.benchmarks.length,
      operations: summary,
      generatedAt: new Date().toISOString(),
    };
  }
}

// --- API Handlers for Express Router ---
import { Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '../lib/logger';

const apex = new Apex();

const SplitSchema = z.object({ operation: z.string(), iterations: z.number().int().positive().optional() });
const PreviewSchema = z.object({ operation: z.string().optional() });

export async function split(req: Request, res: Response) {
  try {
    const parsed = SplitSchema.safeParse(req.body);
    if (!parsed.success) {
      logger.warn('Apex split validation failed', parsed.error);
      return res.status(400).json({ ok: false, error: 'Invalid request', details: parsed.error.errors });
    }
    const result = apex.runBenchmark(parsed.data);
    logger.info('Apex split', { operation: parsed.data.operation, result });
    return res.json(result);
  } catch (err) {
    logger.error('Apex split error', err);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}

export async function preview(req: Request, res: Response) {
  try {
    const parsed = PreviewSchema.safeParse(req.body);
    if (!parsed.success) {
      logger.warn('Apex preview validation failed', parsed.error);
      return res.status(400).json({ ok: false, error: 'Invalid request', details: parsed.error.errors });
    }
    const result = apex.profileOperation(parsed.data);
    logger.info('Apex preview', { operation: parsed.data.operation, result });
    return res.json(result);
  } catch (err) {
    logger.error('Apex preview error', err);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}

export async function rules(req: Request, res: Response) {
  try {
    const result = apex.getMetrics();
    logger.info('Apex rules', { result });
    return res.json(result);
  } catch (err) {
    logger.error('Apex rules error', err);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}

export async function updateRules(req: Request, res: Response) {
  // For demonstration, just log and return not implemented
  logger.warn('Apex updateRules called (not implemented)');
  return res.status(501).json({ ok: false, error: 'Not implemented' });
}
