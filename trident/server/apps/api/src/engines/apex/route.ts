import { Router, Request, Response } from 'express';
import { apexEngine } from './engine';
import { ApexPayload } from './types';

const router = Router();

router.post('/execute', async (req: Request, res: Response) => {
    try {
        const payload = req.body as ApexPayload;
        if (!payload || typeof payload !== 'object') {
            return res.status(400).json({ ok: false, error: 'Invalid request body' });
        }
        const result = await apexEngine(payload);
        return res.json(result);
    } catch (err: any) {
        return res.status(500).json({ ok: false, error: err?.message || 'Internal error' });
    }
});

export default router;
