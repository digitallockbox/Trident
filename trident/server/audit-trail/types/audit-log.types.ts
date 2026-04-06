export const AUDIT_ACTIONS = [
    'manual_override.payout',
    'manual_override.split',
    'manual_override.threshold',
    'manual_override.fee',
    'rpc.switch_primary',
    'rpc.switch_fallback',
    'rpc.add_endpoint',
    'rpc.remove_endpoint',
    'rpc.health_override',
    'fraud.dismiss_alert',
    'fraud.escalate_alert',
    'fraud.rule_create',
    'fraud.rule_update',
    'fraud.rule_delete',
    'fraud.whitelist_add',
    'fraud.whitelist_remove',
    'payout.replay',
    'payout.cancel',
    'payout.force_settle',
    'payout.batch_override',
    'cycle.pause',
    'cycle.resume',
    'cycle.force_close',
    'cycle.extend',
    'cycle.schedule_override',
    'system.config_update',
    'system.role_change',
    'system.log_export',
    'system.emergency_shutdown',
    'system.emergency_restart',
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const AUDIT_SEVERITIES = ['info', 'warning', 'critical', 'emergency'] as const;
export type AuditSeverity = (typeof AUDIT_SEVERITIES)[number];

export const AUDIT_OUTCOMES = ['success', 'failure', 'denied'] as const;
export type AuditOutcome = (typeof AUDIT_OUTCOMES)[number];

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    action: AuditAction;
    module: string;
    severity: AuditSeverity;
    outcome: AuditOutcome;
    description: string;
    operatorWallet: string;
    operatorRole: string;
    endpoint: string;
    ipHash: string;
    metadata: Record<string, unknown>;
    correlationId?: string;
    previousChecksum?: string;
    checksum: string;
}

export interface AuditLogInput {
    action: AuditAction;
    module: string;
    operatorWallet: string;
    operatorRole: string;
    outcome: AuditOutcome;
    description: string;
    endpoint?: string;
    ipAddress?: string;
    metadata?: Record<string, unknown>;
    correlationId?: string;
    severity?: AuditSeverity;
}

export interface AuditLogQuery {
    from?: string;
    to?: string;
    actions?: AuditAction[];
    severities?: AuditSeverity[];
    outcomes?: AuditOutcome[];
    wallet?: string;
    module?: string;
    correlationId?: string;
    search?: string;
    sort?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface AuditQueryResult {
    items: AuditLogEntry[];
    total: number;
    page: number;
    limit: number;
}

export interface AuditIntegrityResult {
    valid: boolean;
    checkedCount: number;
    brokenAtId?: string;
    reason?: string;
}

export interface AuditStats {
    last24h: number;
    last7d: number;
    critical24h: number;
    emergency7d: number;
    lastEmergency?: {
        id: string;
        timestamp: string;
        description: string;
    };
}

export interface AuditOperatorStats {
    wallet: string;
    actions: number;
    criticalActions: number;
    lastActivity: string;
}

export interface AuditRetentionResult {
    deleted: number;
    cutoffIso: string;
}

export interface AuditFeedSubscription {
    severities?: AuditSeverity[];
}

export interface AuditBootstrapOptions {
    jwtSecret: string;
    retentionDays?: number;
    retentionIntervalMs?: number;
    allowedRoles?: string[];
    walletAllowlist?: string[];
}
