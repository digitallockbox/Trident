import type { Express } from 'express';
import type { Server as HttpServer } from 'http';
import { AuditLogService } from '../services/audit-log.service';
import type { AuditStorageAdapter } from '../storage/audit-storage.adapter';
import { InMemoryAuditStorage } from '../storage/in-memory.adapter';
import { auditCatchAll } from '../middleware/audit.middleware';
import { auditRateLimit, requireAuditAuth } from '../middleware/auth-guard.middleware';
import { createAuditAdminRouter } from '../routes/audit-admin.routes';
import { AuditFeedServer } from '../websocket/audit-feed.ws';
import type { AuditBootstrapOptions } from '../types/audit-log.types';

interface BootstrapOptions extends AuditBootstrapOptions {
    storage?: AuditStorageAdapter;
}

interface BootstrapResult {
    auditService: AuditLogService;
    shutdown: () => Promise<void>;
}

export const bootstrapAuditTrail = async (
    app: Express,
    server: HttpServer,
    options: BootstrapOptions,
): Promise<BootstrapResult> => {
    const storage = options.storage ?? new InMemoryAuditStorage();
    const auditService = AuditLogService.create(storage);

    const authGuard = requireAuditAuth({
        jwtSecret: options.jwtSecret,
        allowedRoles: options.allowedRoles ?? ['admin', 'superadmin', 'auditor'],
        walletAllowlist: options.walletAllowlist,
    });

    const adminRouter = createAuditAdminRouter({ service: auditService });
    app.use('/api/admin/audit', authGuard, auditRateLimit(), adminRouter);
    app.use(auditCatchAll(auditService));

    const wsServer = new AuditFeedServer(server, auditService, {
        path: '/ws/audit-feed',
        jwtSecret: options.jwtSecret,
        maxConnectionsPerWallet: 3,
    });

    const retentionDays = Math.max(1, options.retentionDays ?? 365);
    const retentionIntervalMs = options.retentionIntervalMs ?? 24 * 60 * 60 * 1000;

    const retentionJob = setInterval(() => {
        void auditService.enforceRetention(retentionDays);
    }, retentionIntervalMs);

    return {
        auditService,
        shutdown: async () => {
            clearInterval(retentionJob);
            wsServer.shutdown();
        },
    };
};
