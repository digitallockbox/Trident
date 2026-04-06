import type { NextFunction, Request, Response } from 'express';
import type { AuditAction, AuditLogInput } from '../types/audit-log.types';
import type { AuditLogService } from '../services/audit-log.service';

const mapStatusToOutcome = (statusCode: number): AuditLogInput['outcome'] => {
    if (statusCode >= 500) return 'failure';
    if (statusCode >= 400) return 'denied';
    return 'success';
};

interface AuditActionOptions {
    action: AuditAction;
    module: string;
    description?: (req: Request, res: Response) => string;
    metadata?: (req: Request, res: Response) => Record<string, unknown>;
    skip?: (req: Request) => boolean;
}

export const auditAction = (service: AuditLogService, options: AuditActionOptions) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (options.skip?.(req)) {
            next();
            return;
        }

        res.on('finish', () => {
            void service.logAction({
                action: options.action,
                module: options.module,
                operatorWallet: req.user?.wallet ?? 'unknown-wallet',
                operatorRole: req.user?.role ?? 'unknown-role',
                outcome: mapStatusToOutcome(res.statusCode),
                description:
                    options.description?.(req, res) ??
                    `${req.method} ${req.originalUrl} completed with ${res.statusCode}`,
                endpoint: req.originalUrl,
                ipAddress: req.ip,
                metadata: {
                    ...(options.metadata?.(req, res) ?? {}),
                    statusCode: res.statusCode,
                },
            });
        });

        next();
    };
};

export const auditCatchAll = (service: AuditLogService) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const started = Date.now();

        res.on('finish', () => {
            if (!req.originalUrl.startsWith('/api/admin/audit')) {
                return;
            }

            void service.logAction({
                action: 'system.config_update',
                module: 'audit-admin-api',
                operatorWallet: req.user?.wallet ?? 'unknown-wallet',
                operatorRole: req.user?.role ?? 'unknown-role',
                outcome: mapStatusToOutcome(res.statusCode),
                description: `Audit admin request ${req.method} ${req.originalUrl}`,
                endpoint: req.originalUrl,
                ipAddress: req.ip,
                metadata: {
                    durationMs: Date.now() - started,
                    statusCode: res.statusCode,
                },
            });
        });

        next();
    };
};
