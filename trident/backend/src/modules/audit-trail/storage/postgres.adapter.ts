import type { Pool, QueryResultRow } from 'pg';
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

export class PostgresAuditStorage implements AuditStorageAdapter {
    private initialized = false;

    public constructor(private readonly pool: Pool) { }

    public async insert(entry: AuditLogEntry): Promise<void> {
        await this.ensureSchema();
        await this.pool.query(
            `
      INSERT INTO audit_logs (
        id, timestamp, action, module, severity, outcome, description,
        operator_wallet, operator_role, endpoint, ip_hash, metadata,
        correlation_id, previous_checksum, checksum
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12,
        $13, $14, $15
      )
      `,
            [
                entry.id,
                entry.timestamp,
                entry.action,
                entry.module,
                entry.severity,
                entry.outcome,
                entry.description,
                entry.operatorWallet,
                entry.operatorRole,
                entry.endpoint,
                entry.ipHash,
                JSON.stringify(entry.metadata),
                entry.correlationId ?? null,
                entry.previousChecksum ?? null,
                entry.checksum,
            ],
        );
    }

    public async getById(id: string): Promise<AuditLogEntry | null> {
        await this.ensureSchema();
        const result = await this.pool.query('SELECT * FROM audit_logs WHERE id = $1 LIMIT 1', [id]);
        return result.rows[0] ? this.rowToEntry(result.rows[0]) : null;
    }

    public async query(query: AuditLogQuery): Promise<AuditQueryResult> {
        await this.ensureSchema();

        const page = Math.max(1, Number(query.page ?? 1));
        const limit = Math.max(1, Math.min(MAX_LIMIT, Number(query.limit ?? DEFAULT_LIMIT)));
        const offset = (page - 1) * limit;
        const sort = query.sort === 'asc' ? 'ASC' : 'DESC';

        const whereParts: string[] = [];
        const values: unknown[] = [];
        const addParam = (value: unknown): string => {
            values.push(value);
            return `$${values.length}`;
        };

        if (query.from) whereParts.push(`timestamp >= ${addParam(query.from)}`);
        if (query.to) whereParts.push(`timestamp <= ${addParam(query.to)}`);
        if (query.actions?.length) whereParts.push(`action = ANY(${addParam(query.actions)})`);
        if (query.severities?.length) whereParts.push(`severity = ANY(${addParam(query.severities)})`);
        if (query.outcomes?.length) whereParts.push(`outcome = ANY(${addParam(query.outcomes)})`);
        if (query.wallet) whereParts.push(`operator_wallet = ${addParam(query.wallet)}`);
        if (query.module) whereParts.push(`module = ${addParam(query.module)}`);
        if (query.correlationId) whereParts.push(`correlation_id = ${addParam(query.correlationId)}`);
        if (query.search) {
            whereParts.push(`(description ILIKE ${addParam(`%${query.search}%`)} OR metadata::text ILIKE ${addParam(`%${query.search}%`)})`);
        }

        const whereClause = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';

        const countResult = await this.pool.query(`SELECT COUNT(*)::int AS count FROM audit_logs ${whereClause}`, values);
        const rowsResult = await this.pool.query(
            `SELECT * FROM audit_logs ${whereClause} ORDER BY timestamp ${sort} LIMIT ${addParam(limit)} OFFSET ${addParam(offset)}`,
            values,
        );

        return {
            items: rowsResult.rows.map((row) => this.rowToEntry(row)),
            total: countResult.rows[0]?.count ?? 0,
            page,
            limit,
        };
    }

    public async listOperators(limit: number): Promise<AuditOperatorStats[]> {
        await this.ensureSchema();
        const safeLimit = Math.max(1, Math.min(limit, 1000));
        const result = await this.pool.query(
            `
      SELECT
        operator_wallet AS wallet,
        COUNT(*)::int AS actions,
        COUNT(*) FILTER (WHERE severity IN ('critical', 'emergency'))::int AS "criticalActions",
        MAX(timestamp) AS "lastActivity"
      FROM audit_logs
      GROUP BY operator_wallet
      ORDER BY actions DESC
      LIMIT $1
      `,
            [safeLimit],
        );

        return result.rows as AuditOperatorStats[];
    }

    public async getStats(): Promise<AuditStats> {
        await this.ensureSchema();
        const result = await this.pool.query(
            `
      SELECT
        COUNT(*) FILTER (WHERE timestamp >= NOW() - INTERVAL '24 hours')::int AS "last24h",
        COUNT(*) FILTER (WHERE timestamp >= NOW() - INTERVAL '7 days')::int AS "last7d",
        COUNT(*) FILTER (WHERE timestamp >= NOW() - INTERVAL '24 hours' AND severity IN ('critical', 'emergency'))::int AS "critical24h",
        COUNT(*) FILTER (WHERE timestamp >= NOW() - INTERVAL '7 days' AND severity = 'emergency')::int AS "emergency7d"
      FROM audit_logs
      `,
        );

        const latestEmergency = await this.getLatestBySeverity('emergency');

        return {
            ...(result.rows[0] as Omit<AuditStats, 'lastEmergency'>),
            lastEmergency: latestEmergency
                ? {
                    id: latestEmergency.id,
                    timestamp: latestEmergency.timestamp,
                    description: latestEmergency.description,
                }
                : undefined,
        };
    }

    public async verifyChain(from?: string, to?: string): Promise<AuditIntegrityResult> {
        await this.ensureSchema();
        const result = await this.query({ from, to, sort: 'asc', page: 1, limit: MAX_LIMIT });

        if (result.items.length <= 1) {
            return { valid: true, checkedCount: result.items.length };
        }

        for (let i = 1; i < result.items.length; i += 1) {
            if (result.items[i].previousChecksum !== result.items[i - 1].checksum) {
                return {
                    valid: false,
                    checkedCount: i + 1,
                    brokenAtId: result.items[i].id,
                    reason: 'Checksum chain mismatch',
                };
            }
        }

        return { valid: true, checkedCount: result.items.length };
    }

    public async deleteOlderThan(cutoffIso: string): Promise<AuditRetentionResult> {
        await this.ensureSchema();
        const result = await this.pool.query('DELETE FROM audit_logs WHERE timestamp < $1', [cutoffIso]);
        return {
            deleted: result.rowCount ?? 0,
            cutoffIso,
        };
    }

    public async getLatestEntry(): Promise<AuditLogEntry | null> {
        await this.ensureSchema();
        const result = await this.pool.query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 1');
        return result.rows[0] ? this.rowToEntry(result.rows[0]) : null;
    }

    public async getLatestBySeverity(severity: AuditSeverity): Promise<AuditLogEntry | null> {
        await this.ensureSchema();
        const result = await this.pool.query(
            'SELECT * FROM audit_logs WHERE severity = $1 ORDER BY timestamp DESC LIMIT 1',
            [severity],
        );
        return result.rows[0] ? this.rowToEntry(result.rows[0]) : null;
    }

    private async ensureSchema(): Promise<void> {
        if (this.initialized) return;

        await this.pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        timestamp TIMESTAMPTZ NOT NULL,
        action TEXT NOT NULL,
        module TEXT NOT NULL,
        severity TEXT NOT NULL,
        outcome TEXT NOT NULL,
        description TEXT NOT NULL,
        operator_wallet TEXT NOT NULL,
        operator_role TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        ip_hash TEXT NOT NULL,
        metadata JSONB NOT NULL,
        correlation_id TEXT,
        previous_checksum TEXT,
        checksum TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs (timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs (action);
      CREATE INDEX IF NOT EXISTS idx_audit_severity ON audit_logs (severity);
      CREATE INDEX IF NOT EXISTS idx_audit_operator_wallet ON audit_logs (operator_wallet);
      CREATE INDEX IF NOT EXISTS idx_audit_module ON audit_logs (module);
      CREATE INDEX IF NOT EXISTS idx_audit_correlation ON audit_logs (correlation_id);
    `);

        this.initialized = true;
    }

    private rowToEntry(row: QueryResultRow): AuditLogEntry {
        return {
            id: String(row.id),
            timestamp: new Date(row.timestamp).toISOString(),
            action: row.action,
            module: row.module,
            severity: row.severity,
            outcome: row.outcome,
            description: row.description,
            operatorWallet: row.operator_wallet,
            operatorRole: row.operator_role,
            endpoint: row.endpoint,
            ipHash: row.ip_hash,
            metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
            correlationId: row.correlation_id ?? undefined,
            previousChecksum: row.previous_checksum ?? undefined,
            checksum: row.checksum,
        };
    }
}
