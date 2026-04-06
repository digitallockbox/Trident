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

export interface AuditStorageAdapter {
    insert(entry: AuditLogEntry): Promise<void>;
    getById(id: string): Promise<AuditLogEntry | null>;
    query(query: AuditLogQuery): Promise<AuditQueryResult>;
    listOperators(limit: number): Promise<AuditOperatorStats[]>;
    getStats(): Promise<AuditStats>;
    verifyChain(from?: string, to?: string): Promise<AuditIntegrityResult>;
    deleteOlderThan(cutoffIso: string): Promise<AuditRetentionResult>;
    getLatestEntry(): Promise<AuditLogEntry | null>;
    getLatestBySeverity(severity: AuditSeverity): Promise<AuditLogEntry | null>;
}
