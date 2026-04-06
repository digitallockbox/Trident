import { createApp } from './app';
import { env } from './core/config/env';
import { bootstrapAuditTrail } from './modules/audit-trail';
import { securityConfig } from './core/config/security';
import { logger } from './utils/logger';

export const startServer = async (): Promise<void> => {
    const app = createApp();

    const server = app.listen(env.port, env.host, () => {
        logger.info(`Trident backend listening on http://${env.host}:${env.port}`);
    });

    await bootstrapAuditTrail(app, server, {
        jwtSecret: process.env.TRIDENT_JWT_SECRET || securityConfig.jwtSecret,
        retentionDays: Number(process.env.TRIDENT_AUDIT_RETENTION_DAYS ?? 365),
    });

    logger.info('Audit trail bootstrapped');
};
