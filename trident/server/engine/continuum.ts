/**
 * Continuum — Persistent State Flow Engine
 *
 * Manages time-series state transitions, tracks state history,
 * and provides rollback/replay of state changes.
 */
export class Continuum {
  private states: Map<string, Array<{
    version: number;
    state: Record<string, any>;
    timestamp: string;
    actor: string;
  }>> = new Map();

  async execute(data: Record<string, any>): Promise<Record<string, any>> {
    const action = data.action || 'current';

    switch (action) {
      case 'transition':
        return this.transition(data);
      case 'current':
        return this.getCurrent(data);
      case 'history':
        return this.getHistory(data);
      case 'rollback':
        return this.rollback(data);
      case 'diff':
        return this.diff(data);
      default:
        return { status: 'error', engine: 'Continuum', error: `Unknown action: ${action}` };
    }
  }

  private transition(data: Record<string, any>): Record<string, any> {
    const entity = data.entity as string;
    const newState = data.state as Record<string, any>;
    const actor = (data.actor as string) || 'system';

    if (!entity || !newState) {
      return { status: 'error', engine: 'Continuum', error: 'Missing entity or state' };
    }

    if (!this.states.has(entity)) this.states.set(entity, []);
    const history = this.states.get(entity)!;
    const version = history.length + 1;

    history.push({
      version,
      state: { ...newState },
      timestamp: new Date().toISOString(),
      actor,
    });

    if (history.length > 500) history.shift();

    return {
      status: 'success',
      engine: 'Continuum',
      entity,
      version,
      state: newState,
    };
  }

  private getCurrent(data: Record<string, any>): Record<string, any> {
    const entity = data.entity as string;
    if (!entity) return { status: 'error', engine: 'Continuum', error: 'Missing entity' };

    const history = this.states.get(entity);
    if (!history || history.length === 0) {
      return { status: 'success', engine: 'Continuum', entity, current: null };
    }

    return {
      status: 'success',
      engine: 'Continuum',
      entity,
      current: history[history.length - 1],
    };
  }

  private getHistory(data: Record<string, any>): Record<string, any> {
    const entity = data.entity as string;
    const limit = Math.min(Number(data.limit) || 50, 500);
    if (!entity) return { status: 'error', engine: 'Continuum', error: 'Missing entity' };

    const history = this.states.get(entity) || [];
    return {
      status: 'success',
      engine: 'Continuum',
      entity,
      totalVersions: history.length,
      history: history.slice(-limit),
    };
  }

  private rollback(data: Record<string, any>): Record<string, any> {
    const entity = data.entity as string;
    const targetVersion = Number(data.version);
    if (!entity || !isFinite(targetVersion)) {
      return { status: 'error', engine: 'Continuum', error: 'Missing entity or version' };
    }

    const history = this.states.get(entity);
    if (!history) return { status: 'error', engine: 'Continuum', error: 'Entity not found' };

    const target = history.find(h => h.version === targetVersion);
    if (!target) return { status: 'error', engine: 'Continuum', error: `Version ${targetVersion} not found` };

    // Create a new version from the rollback target
    const newVersion = history.length + 1;
    history.push({
      version: newVersion,
      state: { ...target.state },
      timestamp: new Date().toISOString(),
      actor: `rollback-from-v${targetVersion}`,
    });

    return {
      status: 'success',
      engine: 'Continuum',
      entity,
      rolledBackTo: targetVersion,
      newVersion,
      state: target.state,
    };
  }

  private diff(data: Record<string, any>): Record<string, any> {
    const entity = data.entity as string;
    const vA = Number(data.versionA);
    const vB = Number(data.versionB);

    if (!entity || !isFinite(vA) || !isFinite(vB)) {
      return { status: 'error', engine: 'Continuum', error: 'Missing entity, versionA, or versionB' };
    }

    const history = this.states.get(entity);
    if (!history) return { status: 'error', engine: 'Continuum', error: 'Entity not found' };

    const a = history.find(h => h.version === vA);
    const b = history.find(h => h.version === vB);
    if (!a || !b) return { status: 'error', engine: 'Continuum', error: 'Version not found' };

    const allKeys = new Set([...Object.keys(a.state), ...Object.keys(b.state)]);
    const changes: Record<string, { from: any; to: any }> = {};

    for (const key of allKeys) {
      if (JSON.stringify(a.state[key]) !== JSON.stringify(b.state[key])) {
        changes[key] = { from: a.state[key], to: b.state[key] };
      }
    }

    return {
      status: 'success',
      engine: 'Continuum',
      entity,
      versionA: vA,
      versionB: vB,
      changes,
      totalChanges: Object.keys(changes).length,
    };
  }
}
