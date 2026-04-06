
import { Router, Request, Response } from 'express';
import { omegaEngine } from './engine';
import { OmegaPayload } from './types';
import { auth as requireAuth } from '../../../../middleware/auth';
import { validateOmegaPayload } from '../../middleware/validateOmegaPayload';

const router = Router();


router.post(
    '/execute',
    requireAuth,
    validateOmegaPayload,
    async (req: Request, res: Response) => {
        try {
            const payload = (req as any).omegaPayload as OmegaPayload;
            const result = await omegaEngine(payload);
            return res.json(result);
        } catch (err: any) {
            return res.status(500).json({ ok: false, error: err?.message || 'Internal error' });
        }
    }
);

export default router;
