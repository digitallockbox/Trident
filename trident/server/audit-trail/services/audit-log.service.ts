import { createHash, randomUUID } from 'crypto';
import { EventEmitter } from 'events';
import type {
    AuditAction,
    AuditIntegrityResult,
    AuditLogEntry,
    AuditLogInput,
    AuditOperatorStats,
    AuditQueryResult,
    AuditRetentionResult,
    AuditSeverity,
    AuditStats,
} from '../types/audit-log.types';
import type { AuditStorageAdapter } from '../storage/audit-storage.adapter';

const DEFAULT_ENDPOINT = 'unknown-endpoint';

const defaultSeverityMap: Record<AuditAction, AuditSeverity> = {
    'manual_override.payout': 'warning',
    'manual_override.split': 'warning',
    'manual_override.threshold': 'warning',
    'manual_override.fee': 'warning',
    'rpc.switch_primary': 'info',
    'rpc.switch_fallback': 'warning',
    'rpc.add_endpoint': 'warning',
    'rpc.remove_endpoint': 'warning',
    'rpc.health_override': 'warning',
    'fraud.dismiss_alert': 'warning',
    'fraud.escalate_alert': 'critical',
    'fraud.rule_create': 'warning',
    'fraud.rule_update': 'warning',
    'fraud.rule_delete': 'critical',
    'fraud.whitelist_add': 'warning',
    'fraud.whitelist_remove': 'warning',
    'payout.replay': 'critical',
    'payout.cancel': 'critical',
    'payout.force_settle': 'critical',
    'payout.batch_override': 'critical',
    'cycle.pause': 'info',
    'cycle.resume': 'info',
    'cycle.force_close': 'critical',
    'cycle.extend': 'warning',
    'cycle.schedule_override': 'warning',
    'system.config_update': 'warning',
    'system.role_change': 'critical',
    'system.log_export': 'warning',
    'system.emergency_shutdown': 'emergency',
    'system.emergency_restart': 'emergency',
};

const maskEndpoint = (endpoint: string): string => {
    try {
        const url = new URL(endpoint);
        return `${url.protocol}//${url.host}`;
    } catch {
        return endpoint;
    }
};

const hashIpAddress = (ip?: string): string => {
    if (!ip) return 'anon';
    return createHash('sha256').update(ip).digest('hex').slice(0, 16);
};

const sanitizeText = (value: string): string => value.trim().slice(0, 1024);

const computeChecksum = (entry: Omit<AuditLogEntry, 'checksum'>): string => {
    const stableBody = JSON.stringify({
        id: entry.id,
        timestamp: entry.timestamp,
        action: entry.action,
        module: entry.module,
        severity: entry.severity,
        outcome: entry.outcome,
        description: entry.description,
        operatorWallet: entry.operatorWallet,
        operatorRole: entry.operatorRole,
        endpoint: entry.endpoint,
        ipHash: entry.ipHash,
        metadata: entry.metadata,
        correlationId: entry.correlationId,
        previousChecksum: entry.previousChecksum,
    });

    return createHash('sha256').update(stableBody).digest('hex');
};

export class AuditLogService {
    private static instance: AuditLogService | null = null;
    private readonly events = new EventEmitter();

    public static create(storage: AuditStorageAdapter): AuditLogService {
        const service = new AuditLogService(storage);
        AuditLogService.instance = service;
        return service;
    }

    public static getInstance(): AuditLogService {
        if (!AuditLogService.instance) {
            throw new Error('AuditLogService has not been initialized');
        }
        return AuditLogService.instance;
    }

    private constructor(private readonly storage: AuditStorageAdapter) { }

    public subscribe(listener: (entry: AuditLogEntry) => void): () => void {
        this.events.on('entry', listener);
        return () => this.events.off('entry', listener);
    }

    public async logAction(input: AuditLogInput): Promise<AuditLogEntry> {
        const id = randomUUID();
        const timestamp = new Date().toISOString();
        const previous = await this.storage.getLatestEntry();

        const partial: Omit<AuditLogEntry, 'checksum'> = {
            id,
            timestamp,
            action: input.action,
            module: sanitizeText(input.module),
            severity: input.severity ?? defaultSeverityMap[input.action],
            outcome: input.outcome,
            description: sanitizeText(input.description),
            operatorWallet: sanitizeText(input.operatorWallet),
            operatorRole: sanitizeText(input.operatorRole),
            endpoint: maskEndpoint(input.endpoint ?? DEFAULT_ENDPOINT),
            ipHash: hashIpAddress(input.ipAddress),
            metadata: input.metadata ?? {},
            correlationId: input.correlationId,
            previousChecksum: previous?.checksum,
        };

        const entry: AuditLogEntry = {
            ...partial,
            checksum: computeChecksum(partial),
        };

        await this.storage.insert(entry);
        this.events.emit('entry', entry);
        return entry;
    }

    public async logManualOverride(
        operatorWallet: string,
        operatorRole: string,
        action: 'payout' | 'split' | 'threshold' | 'fee',
        description: string,
        metadata: Record<string, unknown> = {},
    ): Promise<AuditLogEntry> {
        return this.logAction({
            action: `manual_override.${action}` as AuditAction,
            module: 'override-engine',
            operatorWallet,
            operatorRole,
            outcome: 'success',
            description,
            metadata,
        });
    }

    public async logRpcSwitch(
        operatorWallet: string,
        operatorRole: string,
        target: 'primary' | 'fallback',
        endpoint: string,
        metadata: Record<string, unknown> = {},
    ): Promise<AuditLogEntry> {
        return this.logAction({
            action: target === 'primary' ? 'rpc.switch_primary' : 'rpc.switch_fallback',
            module: 'rpc-router',
            operatorWallet,
            operatorRole,
            outcome: 'success',
            endpoint,
            description: `RPC switched to ${target}`,
            metadata,
        });
    }

    public async logFraudDismissal(
        operatorWallet: string,
        operatorRole: string,
        alertId: string,
        reason: string,
        riskScore: number,
    ): Promise<AuditLogEntry> {
        return this.logAction({
            action: 'fraud.dismiss_alert',
            module: 'fraud-engine',
            operatorWallet,
            operatorRole,
            outcome: 'success',
            description: `Fraud alert ${alertId} dismissed`,
            metadata: { alertId, reason, riskScore },
        });
    }

    public async logPayoutReplay(
        operatorWallet: string,
        operatorRole: string,
        payoutId: string,
        metadata: Record<string, unknown> = {},
    ): Promise<AuditLogEntry> {
        return this.logAction({
            action: 'payout.replay',
            module: 'payout-engine',
            operatorWallet,
            operatorRole,
            outcome: 'success',
            description: `Replay triggered for payout ${payoutId}`,
            metadata: { payoutId, ...metadata },
        });
    }

    public async logCycleControl(
        operatorWallet: string,
        operatorRole: string,
        action: 'pause' | 'resume' | 'force_close' | 'extend' | 'schedule_override',
        metadata: Record<string, unknown> = {},
    ): Promise<AuditLogEntry> {
        return this.logAction({
            action: `cycle.${action}` as AuditAction,
            module: 'cycle-engine',
            operatorWallet,
            operatorRole,
            outcome: 'success',
            description: `Cycle control action: ${action}`,
            metadata,
        });
    }

    public getById(id: string): Promise<AuditLogEntry | null> {
        return this.storage.getById(id);
    }

    public query(query: Parameters<AuditStorageAdapter['query']>[0]): Promise<AuditQueryResult> {
        return this.storage.query(query);
    }

    public getStats(): Promise<AuditStats> {
        return this.storage.getStats();
    }

    public listOperators(limit: number): Promise<AuditOperatorStats[]> {
        return this.storage.listOperators(limit);
    }

    public verifyChainIntegrity(from?: string, to?: string): Promise<AuditIntegrityResult> {
        return this.storage.verifyChain(from, to);
    }

    public enforceRetention(days = 365): Promise<AuditRetentionResult> {
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        return this.storage.deleteOlderThan(cutoff);
    }
}
