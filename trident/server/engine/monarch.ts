/**
 * Monarch — Governance & Control Engine
 *
 * Manages platform policies, permission rules, feature flags,
 * and governance decisions.
 */
export class Monarch {
  private policies: Map<string, {
    id: string;
    name: string;
    rule: string;
    enforced: boolean;
    createdAt: string;
    updatedAt: string;
  }> = new Map();

  private featureFlags: Map<string, { enabled: boolean; rollout: number }> = new Map();

  async execute(data: Record<string, any>): Promise<Record<string, any>> {
    const action = data.action || 'evaluate';

    switch (action) {
      case 'createPolicy':
        return this.createPolicy(data);
      case 'evaluate':
        return this.evaluate(data);
      case 'listPolicies':
        return this.listPolicies();
      case 'setFlag':
        return this.setFlag(data);
      case 'checkFlag':
        return this.checkFlag(data);
      case 'flags':
        return this.listFlags();
      default:
        return { status: 'error', engine: 'Monarch', error: `Unknown action: ${action}` };
    }
  }

  private createPolicy(data: Record<string, any>): Record<string, any> {
    const name = data.name as string;
    const rule = data.rule as string;
    if (!name || !rule) {
      return { status: 'error', engine: 'Monarch', error: 'Missing policy name or rule' };
    }

    const id = `POL-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    this.policies.set(id, { id, name, rule, enforced: data.enforced !== false, createdAt: now, updatedAt: now });

    return { status: 'success', engine: 'Monarch', policy: this.policies.get(id) };
  }

  private evaluate(data: Record<string, any>): Record<string, any> {
    const { wallet, role, resource, action: targetAction } = data;
    const violations: string[] = [];

    for (const policy of this.policies.values()) {
      if (!policy.enforced) continue;

      // Simple rule evaluation: rules are "role:admin", "resource:*", etc.
      const parts = policy.rule.split(',').map(s => s.trim());
      for (const part of parts) {
        const [key, expected] = part.split(':');
        if (key === 'role' && expected !== '*' && role !== expected) {
          violations.push(`${policy.name}: requires role '${expected}'`);
        }
        if (key === 'resource' && expected !== '*' && resource !== expected) {
          violations.push(`${policy.name}: restricted to resource '${expected}'`);
        }
      }
    }

    return {
      status: 'success',
      engine: 'Monarch',
      allowed: violations.length === 0,
      violations,
      evaluated: this.policies.size,
      context: { wallet, role, resource, action: targetAction },
    };
  }

  private listPolicies(): Record<string, any> {
    return {
      status: 'success',
      engine: 'Monarch',
      policies: Array.from(this.policies.values()),
      total: this.policies.size,
    };
  }

  private setFlag(data: Record<string, any>): Record<string, any> {
    const name = data.flag as string;
    if (!name) return { status: 'error', engine: 'Monarch', error: 'Missing flag name' };

    const enabled = data.enabled !== false;
    const rollout = Math.max(0, Math.min(100, Number(data.rollout) || 100));
    this.featureFlags.set(name, { enabled, rollout });

    return { status: 'success', engine: 'Monarch', flag: name, enabled, rollout };
  }

  private checkFlag(data: Record<string, any>): Record<string, any> {
    const name = data.flag as string;
    if (!name) return { status: 'error', engine: 'Monarch', error: 'Missing flag name' };

    const flag = this.featureFlags.get(name);
    if (!flag) return { status: 'success', engine: 'Monarch', flag: name, active: false, reason: 'not-defined' };

    // Rollout check: deterministic based on wallet hash
    const wallet = (data.wallet as string) || '';
    let hash = 0;
    for (let i = 0; i < wallet.length; i++) {
      hash = (hash * 31 + wallet.charCodeAt(i)) & 0x7fffffff;
    }
    const bucket = hash % 100;
    const active = flag.enabled && bucket < flag.rollout;

    return { status: 'success', engine: 'Monarch', flag: name, active, rollout: flag.rollout };
  }

  private listFlags(): Record<string, any> {
    const flags: Record<string, { enabled: boolean; rollout: number }> = {};
    for (const [name, val] of this.featureFlags.entries()) {
      flags[name] = val;
    }
    return { status: 'success', engine: 'Monarch', flags, total: this.featureFlags.size };
  }
}
