/**
 * Aegis — Security & Protection Engine
 *
 * Validates inputs against threat rules, scores risk,
 * and enforces security policies for the platform.
 */
export class Aegis {
  private readonly blockedPatterns: RegExp[] = [
    /(<script[\s>])/i,
    /(javascript\s*:)/i,
    /(union\s+select)/i,
    /(drop\s+table)/i,
    /(;\s*--)/,
    /(\bexec\s*\()/i,
  ];

  private readonly riskWeights: Record<string, number> = {
    missingAuth: 30,
    suspiciousPayload: 25,
    rateLimitNear: 15,
    unknownOrigin: 20,
    largPayload: 10,
  };

  private scanLog: Array<{ timestamp: string; wallet: string; risk: number; threats: string[] }> = [];

  async execute(data: Record<string, any>): Promise<Record<string, any>> {
    const action = data.action || 'scan';

    switch (action) {
      case 'scan':
        return this.scanPayload(data);
      case 'validate':
        return this.validateAccess(data);
      case 'report':
        return this.threatReport();
      default:
        return { status: 'error', engine: 'Aegis', error: `Unknown action: ${action}` };
    }
  }

  private scanPayload(data: Record<string, any>): Record<string, any> {
    const payload = JSON.stringify(data.payload ?? data);
    const threats: string[] = [];

    for (const pattern of this.blockedPatterns) {
      if (pattern.test(payload)) {
        threats.push(pattern.source);
      }
    }

    let riskScore = 0;
    if (!data.wallet) riskScore += this.riskWeights.missingAuth;
    if (threats.length > 0) riskScore += this.riskWeights.suspiciousPayload * threats.length;
    if (payload.length > 10000) riskScore += this.riskWeights.largPayload;
    if (!data.origin) riskScore += this.riskWeights.unknownOrigin;

    riskScore = Math.min(riskScore, 100);

    const entry = {
      timestamp: new Date().toISOString(),
      wallet: data.wallet || 'anonymous',
      risk: riskScore,
      threats,
    };
    this.scanLog.push(entry);
    if (this.scanLog.length > 1000) this.scanLog.shift();

    return {
      status: riskScore >= 70 ? 'blocked' : 'success',
      engine: 'Aegis',
      riskScore,
      threats,
      allowed: riskScore < 70,
      scannedAt: entry.timestamp,
    };
  }

  private validateAccess(data: Record<string, any>): Record<string, any> {
    const { wallet, role, resource } = data;
    const issues: string[] = [];

    if (!wallet || typeof wallet !== 'string') issues.push('Missing or invalid wallet');
    if (!role || !['admin', 'founder', 'operator', 'viewer'].includes(role)) {
      issues.push('Invalid role');
    }
    if (!resource || typeof resource !== 'string') issues.push('Missing resource');

    const granted = issues.length === 0;

    return {
      status: granted ? 'success' : 'denied',
      engine: 'Aegis',
      granted,
      issues,
      checkedAt: new Date().toISOString(),
    };
  }

  private threatReport(): Record<string, any> {
    const recent = this.scanLog.slice(-100);
    const totalScans = this.scanLog.length;
    const blocked = recent.filter(s => s.risk >= 70).length;
    const avgRisk = recent.length > 0
      ? Math.round(recent.reduce((sum, s) => sum + s.risk, 0) / recent.length)
      : 0;

    return {
      status: 'success',
      engine: 'Aegis',
      totalScans,
      recentBlocked: blocked,
      averageRisk: avgRisk,
      topThreats: this.aggregateThreats(recent),
      generatedAt: new Date().toISOString(),
    };
  }

  private aggregateThreats(entries: typeof this.scanLog): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const entry of entries) {
      for (const t of entry.threats) {
        counts[t] = (counts[t] || 0) + 1;
      }
    }
    return counts;
  }
}
