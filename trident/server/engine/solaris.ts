/**
 * Solaris — Energy & Resource Management Engine
 *
 * Tracks resource consumption, budget allocation,
 * quota enforcement, and usage analytics.
 */
export class Solaris {
  private resources: Map<string, {
    id: string;
    name: string;
    quota: number;
    used: number;
    unit: string;
    lastUpdated: string;
  }> = new Map();

  private usageLog: Array<{ resource: string; amount: number; actor: string; timestamp: string }> = [];

  async execute(data: Record<string, any>): Promise<Record<string, any>> {
    const action = data.action || 'status';

    switch (action) {
      case 'allocate':
        return this.allocate(data);
      case 'consume':
        return this.consume(data);
      case 'release':
        return this.release(data);
      case 'status':
        return this.getStatus(data);
      case 'usage':
        return this.usageReport(data);
      default:
        return { status: 'error', engine: 'Solaris', error: `Unknown action: ${action}` };
    }
  }

  private allocate(data: Record<string, any>): Record<string, any> {
    const name = data.resource as string;
    const quota = Number(data.quota);
    const unit = (data.unit as string) || 'units';

    if (!name || !isFinite(quota) || quota <= 0) {
      return { status: 'error', engine: 'Solaris', error: 'Missing resource name or invalid quota' };
    }

    const id = `RES-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.resources.set(name, {
      id,
      name,
      quota,
      used: 0,
      unit,
      lastUpdated: new Date().toISOString(),
    });

    return { status: 'success', engine: 'Solaris', resource: this.resources.get(name) };
  }

  private consume(data: Record<string, any>): Record<string, any> {
    const name = data.resource as string;
    const amount = Number(data.amount);
    const actor = (data.actor as string) || 'system';

    if (!name || !isFinite(amount) || amount <= 0) {
      return { status: 'error', engine: 'Solaris', error: 'Missing resource or invalid amount' };
    }

    const resource = this.resources.get(name);
    if (!resource) return { status: 'error', engine: 'Solaris', error: `Resource '${name}' not found` };

    const remaining = resource.quota - resource.used;
    if (amount > remaining) {
      return {
        status: 'error',
        engine: 'Solaris',
        error: 'Quota exceeded',
        requested: amount,
        remaining,
        quota: resource.quota,
      };
    }

    resource.used += amount;
    resource.lastUpdated = new Date().toISOString();

    this.usageLog.push({ resource: name, amount, actor, timestamp: resource.lastUpdated });
    if (this.usageLog.length > 1000) this.usageLog.shift();

    return {
      status: 'success',
      engine: 'Solaris',
      resource: name,
      consumed: amount,
      used: resource.used,
      remaining: resource.quota - resource.used,
      utilization: Math.round((resource.used / resource.quota) * 10000) / 100,
    };
  }

  private release(data: Record<string, any>): Record<string, any> {
    const name = data.resource as string;
    const amount = Number(data.amount);

    if (!name || !isFinite(amount) || amount <= 0) {
      return { status: 'error', engine: 'Solaris', error: 'Missing resource or invalid amount' };
    }

    const resource = this.resources.get(name);
    if (!resource) return { status: 'error', engine: 'Solaris', error: `Resource '${name}' not found` };

    resource.used = Math.max(0, resource.used - amount);
    resource.lastUpdated = new Date().toISOString();

    return {
      status: 'success',
      engine: 'Solaris',
      resource: name,
      released: amount,
      used: resource.used,
      remaining: resource.quota - resource.used,
    };
  }

  private getStatus(data: Record<string, any>): Record<string, any> {
    const name = data.resource as string;

    if (name) {
      const resource = this.resources.get(name);
      if (!resource) return { status: 'error', engine: 'Solaris', error: 'Resource not found' };
      return {
        status: 'success',
        engine: 'Solaris',
        resource,
        utilization: Math.round((resource.used / resource.quota) * 10000) / 100,
      };
    }

    const resources: Record<string, any>[] = [];
    for (const r of this.resources.values()) {
      resources.push({
        ...r,
        utilization: Math.round((r.used / r.quota) * 10000) / 100,
      });
    }

    return {
      status: 'success',
      engine: 'Solaris',
      totalResources: resources.length,
      resources,
    };
  }

  private usageReport(data: Record<string, any>): Record<string, any> {
    const limit = Math.min(Number(data.limit) || 100, 1000);
    const resource = data.resource as string;

    let log = this.usageLog;
    if (resource) log = log.filter(l => l.resource === resource);

    const byActor: Record<string, number> = {};
    for (const entry of log) {
      byActor[entry.actor] = (byActor[entry.actor] || 0) + entry.amount;
    }

    return {
      status: 'success',
      engine: 'Solaris',
      totalEntries: log.length,
      recent: log.slice(-limit),
      byActor,
    };
  }
}
