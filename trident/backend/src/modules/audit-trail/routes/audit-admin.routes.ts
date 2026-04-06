import { Router, type Request, type Response } from 'express';
import { AUDIT_ACTIONS, AUDIT_OUTCOMES, AUDIT_SEVERITIES, type AuditAction, type AuditLogQuery } from '../types/audit-log.types';
import type { AuditLogService } from '../services/audit-log.service';

interface AuditAdminRouteDeps {
    service: AuditLogService;
}

const MAX_SEARCH_LENGTH = 120;

const toStringParam = (value: unknown, maxLength = 256): string | undefined => {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    return trimmed.slice(0, maxLength);
};

const parseArrayParam = <T extends string>(value: unknown): T[] | undefined => {
    if (!value) return undefined;
    if (Array.isArray(value)) {
        return value.filter((item): item is T => typeof item === 'string');
    }
    if (typeof value === 'string') {
        return value
            .split(',')
            .map((item) => item.trim())
            .filter((item): item is T => Boolean(item));
    }
    return undefined;
};

const parseEnumArray = <T extends string>(value: unknown, allowed: readonly T[]): T[] | undefined => {
    const parsed = parseArrayParam<string>(value);
    if (!parsed?.length) return undefined;
    const allowSet = new Set<string>(allowed);
    const filtered = parsed.filter((item): item is T => allowSet.has(item));
    return filtered.length ? filtered : undefined;
};

const parseQuery = (req: Request): AuditLogQuery => ({
    from: toStringParam(req.query.from),
    to: toStringParam(req.query.to),
    actions: parseEnumArray<AuditAction>(req.query.actions, AUDIT_ACTIONS),
    severities: parseEnumArray(req.query.severities, AUDIT_SEVERITIES),
    outcomes: parseEnumArray(req.query.outcomes, AUDIT_OUTCOMES),
    wallet: toStringParam(req.query.wallet, 128),
    module: toStringParam(req.query.module, 128),
    correlationId: toStringParam(req.query.correlationId, 128),
    search: toStringParam(req.query.search, MAX_SEARCH_LENGTH)?.replace(/[^\w\s:.,@\-/#]/g, ''),
    sort: req.query.sort === 'asc' ? 'asc' : 'desc',
    page: Number(req.query.page ?? 1),
    limit: Number(req.query.limit ?? 50),
});

const escapeCsvValue = (value: unknown): string => {
    const text = String(value ?? '');
    const escaped = text.replace(/"/g, '""');
    return `"${escaped}"`;
};

export const createAuditAdminRouter = ({ service }: AuditAdminRouteDeps): Router => {
    const router = Router();

    router.get('/logs', async (req: Request, res: Response) => {
        const result = await service.query(parseQuery(req));
        res.json({ ok: true, ...result });
    });

    router.get('/logs/:id', async (req: Request, res: Response) => {
        const entry = await service.getById(req.params.id);
        if (!entry) {
            res.status(404).json({ ok: false, error: 'Audit entry not found' });
            return;
        }
        res.json({ ok: true, entry });
    });

    router.get('/stats', async (_req: Request, res: Response) => {
        const stats = await service.getStats();
        res.json({ ok: true, stats });
    });

    router.get('/operators', async (req: Request, res: Response) => {
        const limit = Math.max(1, Math.min(1000, Number(req.query.limit ?? 100)));
        const operators = await service.listOperators(limit);
        res.json({ ok: true, operators });
    });

    router.post('/verify-integrity', async (req: Request, res: Response) => {
        const { from, to } = req.body as { from?: string; to?: string };
        const integrity = await service.verifyChainIntegrity(from, to);
        res.json({ ok: true, integrity });
    });

    router.post('/export', async (req: Request, res: Response) => {
        const { format = 'json' } = req.body as { format?: 'json' | 'csv' };
        const query = parseQuery(req);
        query.limit = Math.min(500, query.limit ?? 500);
        const result = await service.query(query);

        if (format === 'csv') {
            const headers = [
                'id',
                'timestamp',
                'action',
                'module',
                'severity',
                'outcome',
                'operatorWallet',
                'operatorRole',
                'description',
                'endpoint',
                'correlationId',
            ];

            const lines = [headers.join(',')];
            for (const item of result.items) {
                lines.push(
                    [
                        item.id,
                        item.timestamp,
                        item.action,
                        item.module,
                        item.severity,
                        item.outcome,
                        item.operatorWallet,
                        item.operatorRole,
                        item.description,
                        item.endpoint,
                        item.correlationId ?? '',
                    ]
                        .map(escapeCsvValue)
                        .join(','),
                );
            }

            res.setHeader('content-type', 'text/csv; charset=utf-8');
            res.setHeader('content-disposition', 'attachment; filename="audit-export.csv"');
            res.send(lines.join('\n'));
            return;
        }

        res.json({ ok: true, exported: result.items, total: result.total });
    });

    router.post('/retention', async (req: Request, res: Response) => {
        const days = Math.max(1, Math.min(3650, Number((req.body as { days?: number }).days ?? 365)));
        const result = await service.enforceRetention(days);
        res.json({ ok: true, result });
    });

    router.get('/actions', (_req: Request, res: Response) => {
        res.json({
            ok: true,
            actions: AUDIT_ACTIONS,
            severities: AUDIT_SEVERITIES,
            outcomes: AUDIT_OUTCOMES,
        });
    });

    return router;
};
