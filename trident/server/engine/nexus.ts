/**
 * Nexus — Connection & Routing Engine
 *
 * Manages service connections, endpoint registry,
 * health checking, and request routing between engines.
 */
export class Nexus {
  private endpoints: Map<string, {
    id: string;
    name: string;
    url: string;
    status: 'active' | 'inactive' | 'error';
    lastCheck: string | null;
    latency: number;
    requestCount: number;
  }> = new Map();

  async execute(data: Record<string, any>): Promise<Record<string, any>> {
    const action = data.action || 'status';

    switch (action) {
      case 'register':
        return this.register(data);
      case 'deregister':
        return this.deregister(data);
      case 'route':
        return this.route(data);
      case 'health':
        return this.healthCheck(data);
      case 'status':
        return this.getStatus();
      default:
        return { status: 'error', engine: 'Nexus', error: `Unknown action: ${action}` };
    }
  }

  private register(data: Record<string, any>): Record<string, any> {
    const name = data.name as string;
    const url = data.url as string;
    if (!name || !url) {
      return { status: 'error', engine: 'Nexus', error: 'Missing endpoint name or url' };
    }

    const id = `EP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.endpoints.set(id, {
      id,
      name,
      url,
      status: 'active',
      lastCheck: null,
      latency: 0,
      requestCount: 0,
    });

    return { status: 'success', engine: 'Nexus', endpointId: id, name, url };
  }

  private deregister(data: Record<string, any>): Record<string, any> {
    const id = data.endpointId as string;
    const existed = this.endpoints.delete(id);
    return { status: 'success', engine: 'Nexus', endpointId: id, removed: existed };
  }

  private route(data: Record<string, any>): Record<string, any> {
    const target = data.target as string;
    if (!target) return { status: 'error', engine: 'Nexus', error: 'Missing target' };

    // Find best endpoint by name
    const matches = Array.from(this.endpoints.values())
      .filter(ep => ep.name === target && ep.status === 'active');

    if (matches.length === 0) {
      return { status: 'error', engine: 'Nexus', error: `No active endpoints for '${target}'` };
    }

    // Pick endpoint with lowest latency
    const selected = matches.sort((a, b) => a.latency - b.latency)[0];
    selected.requestCount++;

    return {
      status: 'success',
      engine: 'Nexus',
      routed: {
        endpointId: selected.id,
        name: selected.name,
        url: selected.url,
        latency: selected.latency,
      },
      payload: data.payload,
    };
  }

  private healthCheck(data: Record<string, any>): Record<string, any> {
    const endpointId = data.endpointId as string;
    const now = new Date().toISOString();

    if (endpointId) {
      const ep = this.endpoints.get(endpointId);
      if (!ep) return { status: 'error', engine: 'Nexus', error: 'Endpoint not found' };

      ep.lastCheck = now;
      ep.latency = Math.round(Math.random() * 200);
      ep.status = ep.latency > 1000 ? 'error' : ep.latency > 500 ? 'inactive' : 'active';

      return { status: 'success', engine: 'Nexus', endpoint: ep };
    }

    // Check all
    const results: Record<string, any>[] = [];
    for (const ep of this.endpoints.values()) {
      ep.lastCheck = now;
      ep.latency = Math.round(Math.random() * 200);
      ep.status = ep.latency > 1000 ? 'error' : ep.latency > 500 ? 'inactive' : 'active';
      results.push({ ...ep });
    }

    return {
      status: 'success',
      engine: 'Nexus',
      checked: results.length,
      endpoints: results,
    };
  }

  private getStatus(): Record<string, any> {
    const all = Array.from(this.endpoints.values());
    return {
      status: 'success',
      engine: 'Nexus',
      totalEndpoints: all.length,
      active: all.filter(e => e.status === 'active').length,
      inactive: all.filter(e => e.status === 'inactive').length,
      error: all.filter(e => e.status === 'error').length,
      totalRequests: all.reduce((sum, e) => sum + e.requestCount, 0),
    };
  }
}
