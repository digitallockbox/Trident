/**
 * Echelon — Tier Management & Ranking Engine
 *
 * Scores entities, assigns tiers, maintains leaderboards,
 * and computes rankings based on weighted criteria.
 */
export class Echelon {
  private entities: Map<string, {
    id: string;
    scores: Record<string, number>;
    totalScore: number;
    tier: string;
    updatedAt: string;
  }> = new Map();

  private readonly tierThresholds: Array<{ name: string; min: number }> = [
    { name: 'diamond', min: 900 },
    { name: 'platinum', min: 700 },
    { name: 'gold', min: 500 },
    { name: 'silver', min: 300 },
    { name: 'bronze', min: 100 },
    { name: 'unranked', min: 0 },
  ];

  async execute(data: Record<string, any>): Promise<Record<string, any>> {
    const action = data.action || 'rank';

    switch (action) {
      case 'score':
        return this.score(data);
      case 'rank':
        return this.getRank(data);
      case 'leaderboard':
        return this.leaderboard(data);
      case 'tier':
        return this.getTier(data);
      case 'distribution':
        return this.distribution();
      default:
        return { status: 'error', engine: 'Echelon', error: `Unknown action: ${action}` };
    }
  }

  private score(data: Record<string, any>): Record<string, any> {
    const id = data.id as string;
    const scores = data.scores as Record<string, number>;
    const weights = (data.weights as Record<string, number>) || {};

    if (!id || !scores) {
      return { status: 'error', engine: 'Echelon', error: 'Missing id or scores' };
    }

    let totalScore = 0;
    const normScores: Record<string, number> = {};
    for (const [key, value] of Object.entries(scores)) {
      if (typeof value !== 'number') continue;
      const weight = weights[key] || 1;
      normScores[key] = Math.round(value * 100) / 100;
      totalScore += value * weight;
    }

    totalScore = Math.round(totalScore * 100) / 100;
    const tier = this.computeTier(totalScore);

    this.entities.set(id, {
      id,
      scores: normScores,
      totalScore,
      tier,
      updatedAt: new Date().toISOString(),
    });

    return {
      status: 'success',
      engine: 'Echelon',
      id,
      totalScore,
      tier,
      scores: normScores,
    };
  }

  private getRank(data: Record<string, any>): Record<string, any> {
    const id = data.id as string;
    if (!id) return { status: 'error', engine: 'Echelon', error: 'Missing id' };

    const sorted = Array.from(this.entities.values()).sort((a, b) => b.totalScore - a.totalScore);
    const rank = sorted.findIndex(e => e.id === id) + 1;

    if (rank === 0) {
      return { status: 'success', engine: 'Echelon', id, rank: null, message: 'Entity not scored yet' };
    }

    return {
      status: 'success',
      engine: 'Echelon',
      id,
      rank,
      totalEntities: sorted.length,
      percentile: Math.round((1 - (rank - 1) / sorted.length) * 10000) / 100,
      entity: this.entities.get(id),
    };
  }

  private leaderboard(data: Record<string, any>): Record<string, any> {
    const limit = Math.min(Number(data.limit) || 10, 100);
    const sorted = Array.from(this.entities.values())
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit)
      .map((e, i) => ({ rank: i + 1, ...e }));

    return {
      status: 'success',
      engine: 'Echelon',
      leaderboard: sorted,
      totalEntities: this.entities.size,
    };
  }

  private getTier(data: Record<string, any>): Record<string, any> {
    const score = Number(data.score);
    if (!isFinite(score)) {
      return { status: 'error', engine: 'Echelon', error: 'Missing or invalid score' };
    }
    return { status: 'success', engine: 'Echelon', score, tier: this.computeTier(score) };
  }

  private distribution(): Record<string, any> {
    const dist: Record<string, number> = {};
    for (const t of this.tierThresholds) dist[t.name] = 0;

    for (const entity of this.entities.values()) {
      dist[entity.tier] = (dist[entity.tier] || 0) + 1;
    }

    return {
      status: 'success',
      engine: 'Echelon',
      totalEntities: this.entities.size,
      distribution: dist,
    };
  }

  private computeTier(score: number): string {
    for (const t of this.tierThresholds) {
      if (score >= t.min) return t.name;
    }
    return 'unranked';
  }
}
