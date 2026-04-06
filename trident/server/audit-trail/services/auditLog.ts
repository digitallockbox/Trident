import type { AuditLogInput } from '../types/audit-log.types';

// Minimal stub for auditLog to unblock backend build
export async function auditLog(input: AuditLogInput): Promise<void> {
    // TODO: Connect to real audit-log.service
    // For now, just print to console for dev
    // eslint-disable-next-line no-console
    console.log('[AUDIT]', JSON.stringify(input));
}
