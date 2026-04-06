/**
 * Overwatch — Monitoring & Alerting Engine
 *
 * Tracks engine health, uptime, latency, and status across
 * the platform. Provides a unified monitoring dashboard feed.
 */
export class Overwatch {
  private engineStates: Map<string, {
    status: 'online' | 'degraded' | 'offline';
    lastPing: string;
    latency: number;
    uptime: number;
    errors: number;
  }> = new Map();

  private incidents: Array<{
    id: string;
    engine: string;
    severity: 'info' | 'warning' | 'critical';
    message: string;
    timestamp: string;
    resolved: boolean;
  }> = [];

  private startTime = Date.now();

  async execute(data: Record<string, any>): Promise<Record<string, any>> {
    const action = data.action || 'status';

    switch (action) {
      case 'ping':
        return this.recordPing(data);
      case 'status':
        return this.getStatus(data);
      case 'report':
        return this.fullReport();
      case 'incident':
        return this.createIncident(data);
      case 'resolve':
        return this.resolveIncident(data);
      default:
        return { status: 'error', engine: 'Overwatch', error: `Unknown action: ${action}` };
    }
  }

  private recordPing(data: Record<string, any>): Record<string, any> {
    const engine = data.engine as string;
    if (!engine) {
      return { status: 'error', engine: 'Overwatch', error: 'Missing engine name' };
    }

    const latency = typeof data.latency === 'number' ? data.latency : Math.random() * 100;
    const hasError = data.error === true;
    const existing = this.engineStates.get(engine);

    const newStatus = hasError ? 'offline' : latency > 500 ? 'degraded' : 'online';

    this.engineStates.set(engine, {
      status: newStatus,
      lastPing: new Date().toISOString(),
      latency: Math.round(latency * 100) / 100,
      uptime: existing ? existing.uptime + (hasError ? 0 : 1) : (hasError ? 0 : 1),
      errors: existing ? existing.errors + (hasError ? 1 : 0) : (hasError ? 1 : 0),
    });

    if (hasError || latency > 500) {
      this.incidents.push({
        id: `INC-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        engine,
        severity: hasError ? 'critical' : 'warning',
        message: hasError ? `${engine} is unreachable` : `${engine} latency at ${Math.round(latency)}ms`,
        timestamp: new Date().toISOString(),
        resolved: false,
      });
      if (this.incidents.length > 500) this.incidents.shift();
    }

    return {
      status: 'success',
      engine: 'Overwatch',
      recorded: { engine, status: newStatus, latency: Math.round(latency * 100) / 100 },
    };
  }

  private getStatus(data: Record<string, any>): Record<string, any> {
    const engine = data.engine as string | undefined;

    if (engine) {
      const state = this.engineStates.get(engine);
      return {
        status: 'success',
        engine: 'Overwatch',
        target: engine,
        state: state || { status: 'unknown', lastPing: null, latency: 0, uptime: 0, errors: 0 },
      };
    }

    const engines: Record<string, any> = {};
    for (const [name, state] of this.engineStates.entries()) {
      engines[name] = state;
    }

    return {
      status: 'success',
      engine: 'Overwatch',
      monitored: this.engineStates.size,
      engines,
      platformUptime: Math.round((Date.now() - this.startTime) / 1000),
    };
  }

  private fullReport(): Record<string, any> {
    const totalEngines = this.engineStates.size;
    let online = 0, degraded = 0, offline = 0;

    for (const state of this.engineStates.values()) {
      if (state.status === 'online') online++;
      else if (state.status === 'degraded') degraded++;
      else offline++;
    }

    const openIncidents = this.incidents.filter(i => !i.resolved);

    return {
      status: 'success',
      engine: 'Overwatch',
      summary: { totalEngines, online, degraded, offline },
      openIncidents: openIncidents.length,
      recentIncidents: openIncidents.slice(-10),
      platformUptime: Math.round((Date.now() - this.startTime) / 1000),
      generatedAt: new Date().toISOString(),
    };
  }

  private createIncident(data: Record<string, any>): Record<string, any> {
    const { engine: targetEngine, severity, message } = data;
    if (!targetEngine || !message) {
      return { status: 'error', engine: 'Overwatch', error: 'Missing engine or message' };
    }

    const incident = {
      id: `INC-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      engine: targetEngine,
      severity: (['info', 'warning', 'critical'].includes(severity) ? severity : 'info') as 'info' | 'warning' | 'critical',
      message,
      timestamp: new Date().toISOString(),
      resolved: false,
    };
    this.incidents.push(incident);

    return { status: 'success', engine: 'Overwatch', incident };
  }

  private resolveIncident(data: Record<string, any>): Record<string, any> {
    const { id } = data;
    const incident = this.incidents.find(i => i.id === id);
    if (!incident) {
      return { status: 'error', engine: 'Overwatch', error: 'Incident not found' };
    }
    incident.resolved = true;
    return { status: 'success', engine: 'Overwatch', resolved: incident };
  }
}
