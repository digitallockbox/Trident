// engineRouter.ts
// Unified backend router for all internal engines

import { Router, Request, Response } from 'express';
import { engineRegistry, EngineName } from '../engines/engineRegistry';
import { orchestrate } from '@trident/engine-shared/orchestratorWrapper';

export const engineRouter = Router();

/**
 * POST /engines/:engineName
 * Unified entrypoint for all internal engines.
 */
engineRouter.post('/:engineName', async (req: Request, res: Response) => {
    try {
        const engineName = req.params.engineName as EngineName;
        const payload = req.body;
        const entry = engineRegistry[engineName];

        if (!entry) {
            return res.status(404).json({
                ok: false,
                error: `Engine '${engineName}' not found`,
            });
        }

        // Instantiate engine via factory
        const engine = entry.create();

        // Optional: build execution context (auth, request id, etc.)
        const context = {
            requestId: req.headers['x-request-id'] ?? undefined,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            // userId: req.user?.id, // if you have auth
        };

        // Run through orchestrator (shared pipeline)
        const result = await orchestrate(engine, payload, { log: true });

        return res.status(200).json({
            ok: true,
            engine: engineName,
            version: entry.version,
            result,
        });
    } catch (error: any) {
        // Centralized error handling for all engines
        console.error('[EngineRouter] Engine execution error:', {
            message: error?.message,
            stack: error?.stack,
        });

        return res.status(500).json({
            ok: false,
            error: 'Engine execution failed',
        });
    }
});
