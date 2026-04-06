import type {
    AuditIntegrityResult,
    AuditLogEntry,
    AuditLogQuery,
    AuditOperatorStats,
    AuditQueryResult,
    AuditRetentionResult,
    AuditSeverity,
    AuditStats,
} from '../types/audit-log.types';
import type { AuditStorageAdapter } from './audit-storage.adapter';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 500;

export class InMemoryAuditStorage implements AuditStorageAdapter {
    private readonly entries: AuditLogEntry[] = [];

    public async insert(entry: AuditLogEntry): Promise<void> {
        this.entries.unshift(entry);
    }

    public async getById(id: string): Promise<AuditLogEntry | null> {
        return this.entries.find((entry) => entry.id === id) ?? null;
    }

    public async query(query: AuditLogQuery): Promise<AuditQueryResult> {
        const page = Math.max(1, Number(query.page ?? 1));
        const limit = Math.max(1, Math.min(MAX_LIMIT, Number(query.limit ?? DEFAULT_LIMIT)));
        const sort = query.sort === 'asc' ? 'asc' : 'desc';

        let items = this.entries.filter((entry) => {
            if (query.from && entry.timestamp < query.from) return false;
            if (query.to && entry.timestamp > query.to) return false;
            if (query.actions?.length && !query.actions.includes(entry.action)) return false;
            if (query.severities?.length && !query.severities.includes(entry.severity)) return false;
            if (query.outcomes?.length && !query.outcomes.includes(entry.outcome)) return false;
            if (query.wallet && entry.operatorWallet !== query.wallet) return false;
            if (query.module && entry.module !== query.module) return false;
            if (query.correlationId && entry.correlationId !== query.correlationId) return false;
            if (query.search) {
                const haystack = `${entry.description} ${JSON.stringify(entry.metadata)}`.toLowerCase();
                if (!haystack.includes(query.search.toLowerCase())) return false;
            }
            return true;
        });

        items = items.sort((a, b) => {
            if (sort === 'asc') {
                return a.timestamp.localeCompare(b.timestamp);
            }
            return b.timestamp.localeCompare(a.timestamp);
        });

        const total = items.length;
        const start = (page - 1) * limit;
        return {
            items: items.slice(start, start + limit),
            total,
            page,
            limit,
        };
    }

    public async listOperators(limit: number): Promise<AuditOperatorStats[]> {
        const map = new Map<string, AuditOperatorStats>();

        for (const entry of this.entries) {
            const current = map.get(entry.operatorWallet);
            if (!current) {
                map.set(entry.operatorWallet, {
                    wallet: entry.operatorWallet,
                    actions: 1,
                    criticalActions: entry.severity === 'critical' || entry.severity === 'emergency' ? 1 : 0,
                    lastActivity: entry.timestamp,
                });
            } else {
                current.actions += 1;
                if (entry.severity === 'critical' || entry.severity === 'emergency') {
                    current.criticalActions += 1;
                }
                if (entry.timestamp > current.lastActivity) {
                    current.lastActivity = entry.timestamp;
                }
            }
        }

        return Array.from(map.values())
            .sort((a, b) => b.actions - a.actions)
            .slice(0, Math.max(1, Math.min(limit, 1000)));
    }

    public async getStats(): Promise<AuditStats> {
        const now = Date.now();
        const d24 = now - 24 * 60 * 60 * 1000;
        const d7 = now - 7 * 24 * 60 * 60 * 1000;

        let last24h = 0;
        let last7d = 0;
        let critical24h = 0;
        let emergency7d = 0;

        for (const entry of this.entries) {
            const stamp = Date.parse(entry.timestamp);
            if (stamp >= d24) {
                last24h += 1;
                if (entry.severity === 'critical' || entry.severity === 'emergency') {
                    critical24h += 1;
                }
            }
            if (stamp >= d7) {
                last7d += 1;
                if (entry.severity === 'emergency') {
                    emergency7d += 1;
                }
            }
        }

        const lastEmergency = this.entries.find((entry) => entry.severity === 'emergency');

        return {
            last24h,
            last7d,
            critical24h,
            emergency7d,
            lastEmergency: lastEmergency
                ? {
                    id: lastEmergency.id,
                    timestamp: lastEmergency.timestamp,
                    description: lastEmergency.description,
                }
                : undefined,
        };
    }

    public async verifyChain(from?: string, to?: string): Promise<AuditIntegrityResult> {
        const scoped = this.entries
            .filter((entry) => {
                if (from && entry.timestamp < from) return false;
                if (to && entry.timestamp > to) return false;
                return true;
            })
            .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

        if (scoped.length <= 1) {
            return { valid: true, checkedCount: scoped.length };
        }

        for (let i = 1; i < scoped.length; i += 1) {
            if (scoped[i].previousChecksum !== scoped[i - 1].checksum) {
                return {
                    valid: false,
                    checkedCount: i + 1,
                    brokenAtId: scoped[i].id,
                    reason: 'Checksum chain mismatch',
                };
            }
        }

        return { valid: true, checkedCount: scoped.length };
    }

    public async deleteOlderThan(cutoffIso: string): Promise<AuditRetentionResult> {
        const before = this.entries.length;
        const keep = this.entries.filter((entry) => entry.timestamp >= cutoffIso);
        this.entries.length = 0;
        this.entries.push(...keep);
        return {
            deleted: before - this.entries.length,
            cutoffIso,
        };
    }

    public async getLatestEntry(): Promise<AuditLogEntry | null> {
        return this.entries[0] ?? null;
    }

    public async getLatestBySeverity(severity: AuditSeverity): Promise<AuditLogEntry | null> {
        return this.entries.find((entry) => entry.severity === severity) ?? null;
    }
}
