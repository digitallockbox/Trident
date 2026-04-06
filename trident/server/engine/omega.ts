/**
 * Omega — Final Resolution Engine
 *
 * Performs final-state determination, resolution of conflicts,
 * consensus calculation, and settlement of pending operations.
 */
export class Omega {
  private resolutions: Array<{
    id: string;
    topic: string;
    verdict: string;
    confidence: number;
    timestamp: string;
  }> = [];

  async execute(data: Record<string, any>): Promise<Record<string, any>> {
    const action = data.action || 'resolve';

    switch (action) {
      case 'resolve':
        return this.resolve(data);
      case 'consensus':
        return this.consensus(data);
      case 'settle':
        return this.settle(data);
      case 'history':
        return this.getHistory(data);
      default:
        return { status: 'error', engine: 'Omega', error: `Unknown action: ${action}` };
    }
  }

  private resolve(data: Record<string, any>): Record<string, any> {
    const candidates = Array.isArray(data.candidates) ? data.candidates : [];
    const criteria = (data.criteria as string) || 'score';

    if (candidates.length === 0) {
      return { status: 'success', engine: 'Omega', winner: null, message: 'No candidates' };
    }

    let winner: any;
    switch (criteria) {
      case 'score':
        winner = candidates.reduce((best: any, c: any) =>
          (Number(c.score) || 0) > (Number(best.score) || 0) ? c : best
        );
        break;
      case 'priority':
        winner = candidates.reduce((best: any, c: any) =>
          (Number(c.priority) || 0) > (Number(best.priority) || 0) ? c : best
        );
        break;
      case 'timestamp':
        winner = candidates.reduce((best: any, c: any) =>
          (c.timestamp || '') > (best.timestamp || '') ? c : best
        );
        break;
      default:
        winner = candidates[0];
    }

    const resolution = {
      id: `RES-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      topic: (data.topic as string) || 'general',
      verdict: JSON.stringify(winner),
      confidence: 1,
      timestamp: new Date().toISOString(),
    };
    this.resolutions.push(resolution);
    if (this.resolutions.length > 500) this.resolutions.shift();

    return {
      status: 'success',
      engine: 'Omega',
      winner,
      criteria,
      candidates: candidates.length,
      resolutionId: resolution.id,
    };
  }

  private consensus(data: Record<string, any>): Record<string, any> {
    const votes = Array.isArray(data.votes) ? data.votes.map(String) : [];
    if (votes.length === 0) {
      return { status: 'success', engine: 'Omega', consensus: null, message: 'No votes' };
    }

    const counts: Record<string, number> = {};
    for (const v of votes) {
      counts[v] = (counts[v] || 0) + 1;
    }

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const topVote = sorted[0];
    const consensusRatio = topVote[1] / votes.length;
    const threshold = Number(data.threshold) || 0.5;
    const reached = consensusRatio >= threshold;

    return {
      status: 'success',
      engine: 'Omega',
      consensus: reached ? topVote[0] : null,
      reached,
      ratio: Math.round(consensusRatio * 10000) / 10000,
      threshold,
      distribution: counts,
      totalVotes: votes.length,
    };
  }

  private settle(data: Record<string, any>): Record<string, any> {
    const operations = Array.isArray(data.operations) ? data.operations : [];
    const settled: Array<{ id: string; status: string }> = [];
    const conflicts: Array<{ ids: string[]; reason: string }> = [];

    // Detect conflicts: operations targeting the same resource
    const byResource: Record<string, any[]> = {};
    for (const op of operations) {
      const resource = (op.resource as string) || 'default';
      if (!byResource[resource]) byResource[resource] = [];
      byResource[resource].push(op);
    }

    for (const [resource, ops] of Object.entries(byResource)) {
      if (ops.length === 1) {
        settled.push({ id: ops[0].id || resource, status: 'settled' });
      } else {
        // Conflict: pick highest priority
        const winner = ops.reduce((best, o) =>
          (Number(o.priority) || 0) > (Number(best.priority) || 0) ? o : best
        );
        settled.push({ id: winner.id || resource, status: 'settled' });
        const losers = ops.filter(o => o !== winner).map(o => o.id || 'unknown');
        conflicts.push({ ids: [winner.id || resource, ...losers], reason: `Resource conflict on '${resource}'` });
      }
    }

    return {
      status: 'success',
      engine: 'Omega',
      settled: settled.length,
      conflicts: conflicts.length,
      details: { settled, conflicts },
    };
  }

  private getHistory(data: Record<string, any>): Record<string, any> {
    const limit = Math.min(Number(data.limit) || 50, 500);
    return {
      status: 'success',
      engine: 'Omega',
      resolutions: this.resolutions.slice(-limit),
      total: this.resolutions.length,
    };
  }
}
