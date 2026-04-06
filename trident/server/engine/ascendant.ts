/**
 * Ascendant — Elevation & Advancement Engine
 *
 * Manages progression systems, level advancement,
 * achievement tracking, and milestone evaluation.
 */
export class Ascendant {
  private entities: Map<string, {
    id: string;
    level: number;
    xp: number;
    achievements: string[];
    milestones: Array<{ name: string; reachedAt: string }>;
  }> = new Map();

  private readonly xpPerLevel = 1000;

  async execute(data: Record<string, any>): Promise<Record<string, any>> {
    const action = data.action || 'status';

    switch (action) {
      case 'grant':
        return this.grantXp(data);
      case 'achieve':
        return this.unlockAchievement(data);
      case 'status':
        return this.getStatus(data);
      case 'leaderboard':
        return this.leaderboard(data);
      case 'milestone':
        return this.checkMilestone(data);
      default:
        return { status: 'error', engine: 'Ascendant', error: `Unknown action: ${action}` };
    }
  }

  private getOrCreate(id: string) {
    if (!this.entities.has(id)) {
      this.entities.set(id, { id, level: 1, xp: 0, achievements: [], milestones: [] });
    }
    return this.entities.get(id)!;
  }

  private grantXp(data: Record<string, any>): Record<string, any> {
    const id = data.id as string;
    const amount = Number(data.amount);
    if (!id || !isFinite(amount) || amount <= 0) {
      return { status: 'error', engine: 'Ascendant', error: 'Missing id or invalid amount' };
    }

    const entity = this.getOrCreate(id);
    entity.xp += Math.floor(amount);

    const oldLevel = entity.level;
    entity.level = Math.floor(entity.xp / this.xpPerLevel) + 1;
    const leveledUp = entity.level > oldLevel;

    if (leveledUp) {
      entity.milestones.push({ name: `level-${entity.level}`, reachedAt: new Date().toISOString() });
    }

    return {
      status: 'success',
      engine: 'Ascendant',
      id,
      xp: entity.xp,
      level: entity.level,
      leveledUp,
      xpToNext: (entity.level * this.xpPerLevel) - entity.xp,
    };
  }

  private unlockAchievement(data: Record<string, any>): Record<string, any> {
    const id = data.id as string;
    const achievement = data.achievement as string;
    if (!id || !achievement) {
      return { status: 'error', engine: 'Ascendant', error: 'Missing id or achievement' };
    }

    const entity = this.getOrCreate(id);
    if (entity.achievements.includes(achievement)) {
      return { status: 'success', engine: 'Ascendant', id, achievement, alreadyUnlocked: true };
    }

    entity.achievements.push(achievement);
    return {
      status: 'success',
      engine: 'Ascendant',
      id,
      achievement,
      totalAchievements: entity.achievements.length,
      unlockedAt: new Date().toISOString(),
    };
  }

  private getStatus(data: Record<string, any>): Record<string, any> {
    const id = data.id as string;
    if (!id) return { status: 'error', engine: 'Ascendant', error: 'Missing id' };

    const entity = this.entities.get(id);
    if (!entity) return { status: 'success', engine: 'Ascendant', id, found: false };

    return {
      status: 'success',
      engine: 'Ascendant',
      ...entity,
      xpToNext: (entity.level * this.xpPerLevel) - entity.xp,
      progress: Math.round(((entity.xp % this.xpPerLevel) / this.xpPerLevel) * 10000) / 100,
    };
  }

  private leaderboard(data: Record<string, any>): Record<string, any> {
    const limit = Math.min(Number(data.limit) || 10, 100);
    const sorted = Array.from(this.entities.values())
      .sort((a, b) => b.xp - a.xp)
      .slice(0, limit)
      .map((e, i) => ({ rank: i + 1, id: e.id, level: e.level, xp: e.xp }));

    return { status: 'success', engine: 'Ascendant', leaderboard: sorted, totalEntities: this.entities.size };
  }

  private checkMilestone(data: Record<string, any>): Record<string, any> {
    const id = data.id as string;
    const milestone = data.milestone as string;
    if (!id || !milestone) {
      return { status: 'error', engine: 'Ascendant', error: 'Missing id or milestone' };
    }

    const entity = this.entities.get(id);
    if (!entity) return { status: 'success', engine: 'Ascendant', reached: false, reason: 'entity-not-found' };

    const found = entity.milestones.find(m => m.name === milestone);
    return {
      status: 'success',
      engine: 'Ascendant',
      id,
      milestone,
      reached: !!found,
      reachedAt: found?.reachedAt || null,
    };
  }
}

// --- API Handlers for Express Router ---
import { Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '../lib/logger';

const ascendant = new Ascendant();

// Request validation schemas
const RegisterSchema = z.object({ id: z.string(), amount: z.number().positive() });
const VerifySchema = z.object({ id: z.string(), achievement: z.string() });
const ProfileSchema = z.object({ id: z.string() });

export async function register(req: Request, res: Response) {
  try {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      logger.warn('Ascendant register validation failed', parsed.error);
      return res.status(400).json({ ok: false, error: 'Invalid request', details: parsed.error.errors });
    }
    const result = ascendant.grantXp(parsed.data);
    logger.info('Ascendant register', { id: parsed.data.id, result });
    return res.json(result);
  } catch (err) {
    logger.error('Ascendant register error', err);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}

export async function verify(req: Request, res: Response) {
  try {
    const parsed = VerifySchema.safeParse(req.body);
    if (!parsed.success) {
      logger.warn('Ascendant verify validation failed', parsed.error);
      return res.status(400).json({ ok: false, error: 'Invalid request', details: parsed.error.errors });
    }
    const result = ascendant.unlockAchievement(parsed.data);
    logger.info('Ascendant verify', { id: parsed.data.id, result });
    return res.json(result);
  } catch (err) {
    logger.error('Ascendant verify error', err);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}

export async function profile(req: Request, res: Response) {
  try {
    const parsed = ProfileSchema.safeParse(req.params);
    if (!parsed.success) {
      logger.warn('Ascendant profile validation failed', parsed.error);
      return res.status(400).json({ ok: false, error: 'Invalid request', details: parsed.error.errors });
    }
    const result = ascendant.getStatus(parsed.data);
    logger.info('Ascendant profile', { id: parsed.data.id, result });
    return res.json(result);
  } catch (err) {
    logger.error('Ascendant profile error', err);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}
