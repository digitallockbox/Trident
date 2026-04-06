/**
 * Sovereign — Autonomous Decision Engine
 *
 * Makes rule-based decisions autonomously, evaluates conditions,
 * and produces verdicts with confidence scores.
 */
export class Sovereign {
  private rules: Array<{
    id: string;
    name: string;
    conditions: Array<{ field: string; operator: string; value: any }>;
    verdict: string;
    priority: number;
  }> = [];

  private decisions: Array<{
    ruleId: string;
    verdict: string;
    confidence: number;
    timestamp: string;
  }> = [];

  async execute(data: Record<string, any>): Promise<Record<string, any>> {
    const action = data.action || 'decide';

    switch (action) {
      case 'addRule':
        return this.addRule(data);
      case 'decide':
        return this.decide(data);
      case 'rules':
        return this.listRules();
      case 'history':
        return this.decisionHistory(data);
      default:
        return { status: 'error', engine: 'Sovereign', error: `Unknown action: ${action}` };
    }
  }

  private addRule(data: Record<string, any>): Record<string, any> {
    const name = data.name as string;
    const conditions = data.conditions as Array<{ field: string; operator: string; value: any }>;
    const verdict = data.verdict as string;

    if (!name || !Array.isArray(conditions) || !verdict) {
      return { status: 'error', engine: 'Sovereign', error: 'Missing name, conditions, or verdict' };
    }

    const rule = {
      id: `RULE-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      conditions,
      verdict,
      priority: Number(data.priority) || 0,
    };
    this.rules.push(rule);
    this.rules.sort((a, b) => b.priority - a.priority);

    return { status: 'success', engine: 'Sovereign', rule };
  }

  private decide(data: Record<string, any>): Record<string, any> {
    const context = data.context as Record<string, any>;
    if (!context) {
      return { status: 'error', engine: 'Sovereign', error: 'Missing decision context' };
    }

    let matchedRule: typeof this.rules[0] | null = null;
    let matchedConditions = 0;
    let totalConditions = 0;

    for (const rule of this.rules) {
      let matches = 0;
      for (const cond of rule.conditions) {
        totalConditions++;
        const actual = context[cond.field];
        if (this.evaluateCondition(actual, cond.operator, cond.value)) {
          matches++;
        }
      }
      if (matches === rule.conditions.length) {
        matchedRule = rule;
        matchedConditions = matches;
        break; // First match by priority
      }
    }

    if (!matchedRule) {
      return {
        status: 'success',
        engine: 'Sovereign',
        verdict: 'no-match',
        confidence: 0,
        rulesEvaluated: this.rules.length,
      };
    }

    const confidence = matchedConditions / Math.max(totalConditions, 1);
    const decision = {
      ruleId: matchedRule.id,
      verdict: matchedRule.verdict,
      confidence: Math.round(confidence * 10000) / 10000,
      timestamp: new Date().toISOString(),
    };
    this.decisions.push(decision);
    if (this.decisions.length > 1000) this.decisions.shift();

    return {
      status: 'success',
      engine: 'Sovereign',
      verdict: matchedRule.verdict,
      ruleName: matchedRule.name,
      confidence: decision.confidence,
      decidedAt: decision.timestamp,
    };
  }

  private evaluateCondition(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'eq': return actual === expected;
      case 'neq': return actual !== expected;
      case 'gt': return typeof actual === 'number' && actual > expected;
      case 'gte': return typeof actual === 'number' && actual >= expected;
      case 'lt': return typeof actual === 'number' && actual < expected;
      case 'lte': return typeof actual === 'number' && actual <= expected;
      case 'contains': return typeof actual === 'string' && actual.includes(String(expected));
      case 'in': return Array.isArray(expected) && expected.includes(actual);
      case 'exists': return actual !== undefined && actual !== null;
      default: return false;
    }
  }

  private listRules(): Record<string, any> {
    return { status: 'success', engine: 'Sovereign', rules: this.rules, total: this.rules.length };
  }

  private decisionHistory(data: Record<string, any>): Record<string, any> {
    const limit = Math.min(Number(data.limit) || 50, 500);
    return {
      status: 'success',
      engine: 'Sovereign',
      decisions: this.decisions.slice(-limit),
      total: this.decisions.length,
    };
  }
}
