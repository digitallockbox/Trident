/**
 * Chronos — Time & Scheduling Engine
 *
 * Manages scheduled tasks, cron-like job definitions,
 * and time-window calculations for platform operations.
 */
export class Chronos {
  private jobs: Map<string, {
    id: string;
    name: string;
    intervalMs: number;
    nextRun: number;
    lastRun: string | null;
    runs: number;
    enabled: boolean;
  }> = new Map();

  async execute(data: Record<string, any>): Promise<Record<string, any>> {
    const action = data.action || 'status';

    switch (action) {
      case 'schedule':
        return this.schedule(data);
      case 'cancel':
        return this.cancel(data);
      case 'tick':
        return this.tick();
      case 'status':
        return this.status(data);
      case 'window':
        return this.timeWindow(data);
      default:
        return { status: 'error', engine: 'Chronos', error: `Unknown action: ${action}` };
    }
  }

  private schedule(data: Record<string, any>): Record<string, any> {
    const name = data.name as string;
    const intervalMs = Number(data.intervalMs);
    if (!name || !isFinite(intervalMs) || intervalMs < 1000) {
      return { status: 'error', engine: 'Chronos', error: 'Missing name or invalid intervalMs (min 1000)' };
    }

    const id = `JOB-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.jobs.set(id, {
      id,
      name,
      intervalMs,
      nextRun: Date.now() + intervalMs,
      lastRun: null,
      runs: 0,
      enabled: true,
    });

    return { status: 'success', engine: 'Chronos', job: this.jobs.get(id) };
  }

  private cancel(data: Record<string, any>): Record<string, any> {
    const id = data.id as string;
    const job = this.jobs.get(id);
    if (!job) return { status: 'error', engine: 'Chronos', error: 'Job not found' };

    job.enabled = false;
    return { status: 'success', engine: 'Chronos', cancelled: job };
  }

  private tick(): Record<string, any> {
    const now = Date.now();
    const fired: string[] = [];

    for (const job of this.jobs.values()) {
      if (job.enabled && now >= job.nextRun) {
        job.lastRun = new Date().toISOString();
        job.runs++;
        job.nextRun = now + job.intervalMs;
        fired.push(job.id);
      }
    }

    return {
      status: 'success',
      engine: 'Chronos',
      tickAt: new Date().toISOString(),
      firedJobs: fired,
      totalActive: Array.from(this.jobs.values()).filter(j => j.enabled).length,
    };
  }

  private status(data: Record<string, any>): Record<string, any> {
    const id = data.id as string;
    if (id) {
      const job = this.jobs.get(id);
      return { status: 'success', engine: 'Chronos', job: job || null };
    }

    const jobs = Array.from(this.jobs.values());
    return {
      status: 'success',
      engine: 'Chronos',
      totalJobs: jobs.length,
      active: jobs.filter(j => j.enabled).length,
      jobs,
    };
  }

  private timeWindow(data: Record<string, any>): Record<string, any> {
    const start = data.start ? new Date(data.start).getTime() : Date.now() - 3600000;
    const end = data.end ? new Date(data.end).getTime() : Date.now();

    if (!isFinite(start) || !isFinite(end)) {
      return { status: 'error', engine: 'Chronos', error: 'Invalid start or end time' };
    }

    const duration = end - start;
    return {
      status: 'success',
      engine: 'Chronos',
      window: {
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString(),
        durationMs: duration,
        durationHuman: this.humanDuration(duration),
      },
    };
  }

  private humanDuration(ms: number): string {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ${h % 24}h`;
    if (h > 0) return `${h}h ${m % 60}m`;
    if (m > 0) return `${m}m ${s % 60}s`;
    return `${s}s`;
  }
}
