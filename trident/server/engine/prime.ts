/**
 * Prime — Core Kernel Engine
 *
 * The foundational engine providing system diagnostics,
 * configuration management, and platform health aggregation.
 */
export class Prime {
  private config: Map<string, any> = new Map();
  private bootTime = Date.now();
  private heartbeats: Array<{ source: string; timestamp: string }> = [];

  async execute(data: Record<string, any>): Promise<Record<string, any>> {
    const action = data.action || 'diagnostics';

    switch (action) {
      case 'diagnostics':
        return this.diagnostics();
      case 'config':
        return this.manageConfig(data);
      case 'heartbeat':
        return this.heartbeat(data);
      case 'health':
        return this.healthAggregation(data);
      default:
        return { status: 'error', engine: 'Prime', error: `Unknown action: ${action}` };
    }
  }

  private diagnostics(): Record<string, any> {
    const uptimeMs = Date.now() - this.bootTime;
    const mem = process.memoryUsage();

    return {
      status: 'success',
      engine: 'Prime',
      diagnostics: {
        uptime: {
          ms: uptimeMs,
          human: this.humanDuration(uptimeMs),
        },
        memory: {
          heapUsed: Math.round(mem.heapUsed / 1024 / 1024 * 100) / 100,
          heapTotal: Math.round(mem.heapTotal / 1024 / 1024 * 100) / 100,
          rss: Math.round(mem.rss / 1024 / 1024 * 100) / 100,
          unit: 'MB',
        },
        node: process.version,
        platform: process.platform,
        pid: process.pid,
        configKeys: this.config.size,
        recentHeartbeats: this.heartbeats.length,
      },
      generatedAt: new Date().toISOString(),
    };
  }

  private manageConfig(data: Record<string, any>): Record<string, any> {
    const op = data.op as string || 'get';
    const key = data.key as string;

    switch (op) {
      case 'set':
        if (!key) return { status: 'error', engine: 'Prime', error: 'Missing key' };
        this.config.set(key, data.value);
        return { status: 'success', engine: 'Prime', key, set: true };
      case 'get':
        if (!key) {
          const all: Record<string, any> = {};
          for (const [k, v] of this.config.entries()) all[k] = v;
          return { status: 'success', engine: 'Prime', config: all };
        }
        return { status: 'success', engine: 'Prime', key, value: this.config.get(key) ?? null };
      case 'delete':
        if (!key) return { status: 'error', engine: 'Prime', error: 'Missing key' };
        const existed = this.config.delete(key);
        return { status: 'success', engine: 'Prime', key, deleted: existed };
      default:
        return { status: 'error', engine: 'Prime', error: `Unknown config op: ${op}` };
    }
  }

  private heartbeat(data: Record<string, any>): Record<string, any> {
    const source = (data.source as string) || 'unknown';
    this.heartbeats.push({ source, timestamp: new Date().toISOString() });
    if (this.heartbeats.length > 200) this.heartbeats.shift();

    return {
      status: 'success',
      engine: 'Prime',
      source,
      received: true,
      totalHeartbeats: this.heartbeats.length,
    };
  }

  private healthAggregation(data: Record<string, any>): Record<string, any> {
    const engines = Array.isArray(data.engines) ? data.engines : [];
    let healthy = 0, degraded = 0, down = 0;

    for (const e of engines) {
      if (e.status === 'online' || e.status === 'healthy') healthy++;
      else if (e.status === 'degraded') degraded++;
      else down++;
    }

    const total = engines.length || 1;
    const healthScore = Math.round(((healthy + degraded * 0.5) / total) * 10000) / 100;

    return {
      status: 'success',
      engine: 'Prime',
      healthScore,
      summary: { healthy, degraded, down, total: engines.length },
      grade: healthScore >= 95 ? 'A' : healthScore >= 80 ? 'B' : healthScore >= 60 ? 'C' : 'D',
      checkedAt: new Date().toISOString(),
    };
  }

  private humanDuration(ms: number): string {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ${h % 24}h ${m % 60}m`;
    if (h > 0) return `${h}h ${m % 60}m`;
    if (m > 0) return `${m}m ${s % 60}s`;
    return `${s}s`;
  }
}
