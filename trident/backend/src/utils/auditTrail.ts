import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import type { AuditLog } from '../types/models/auditLog';
import { AuditLogService } from '../modules/audit-trail/services/audit-log.service';
import type { AuditAction } from '../modules/audit-trail/types/audit-log.types';

const MAX_IN_MEMORY_AUDIT_LOGS = 500;
const auditBuffer: AuditLog[] = [];

const auditFilePath = path.join(process.cwd(), 'logs', 'audit', 'operator-actions.log');

export interface AuditInput {
    action: string;
    actorWallet: string;
    actorRole: string;
    target: string;
    status: 'success' | 'error';
    details: Record<string, unknown>;
}

const actionMap: Record<string, AuditAction> = {
    'cycle.override': 'cycle.schedule_override',
    'rpc.switch': 'rpc.switch_primary',
    'rpc.mark_unhealthy': 'rpc.health_override',
    'fraud.dismiss': 'fraud.dismiss_alert',
    'payout.replay': 'payout.replay',
    'cycle.validate': 'cycle.resume',
    'engine.reset': 'system.emergency_restart',
};

const ensureAuditDir = async (): Promise<void> => {
    await fs.mkdir(path.dirname(auditFilePath), { recursive: true });
};

export const recordAuditLog = async (input: AuditInput): Promise<AuditLog> => {
    const entry: AuditLog = {
        id: randomUUID(),
        action: input.action,
        actorWallet: input.actorWallet,
        actorRole: input.actorRole,
        target: input.target,
        status: input.status,
        timestamp: new Date().toISOString(),
        details: input.details,
    };

    await ensureAuditDir();
    await fs.appendFile(auditFilePath, `${JSON.stringify(entry)}\n`, 'utf8');

    try {
        const service = AuditLogService.getInstance();
        await service.logAction({
            action: actionMap[input.action] ?? 'system.config_update',
            module: input.target,
            operatorWallet: input.actorWallet,
            operatorRole: input.actorRole,
            outcome: input.status === 'success' ? 'success' : 'failure',
            description: `${input.action} -> ${input.status}`,
            endpoint: input.target,
            metadata: input.details,
            correlationId: typeof input.details.correlationId === 'string' ? input.details.correlationId : undefined,
        });
    } catch {
        // Legacy fallback keeps operator routes functional before audit bootstrap initialization.
    }

    auditBuffer.unshift(entry);
    if (auditBuffer.length > MAX_IN_MEMORY_AUDIT_LOGS) {
        auditBuffer.length = MAX_IN_MEMORY_AUDIT_LOGS;
    }

    return entry;
};

export const listAuditLogs = (limit = 100): AuditLog[] => {
    const safeLimit = Math.max(1, Math.min(limit, MAX_IN_MEMORY_AUDIT_LOGS));
    return auditBuffer.slice(0, safeLimit);
};
