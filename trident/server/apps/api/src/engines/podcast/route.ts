import { Router, Request, Response } from 'express';
import { podcastEngine } from './engine';
import { PodcastPayloadSchema, PodcastPayload } from './types';

const router = Router();

router.post('/execute', async (req: Request, res: Response) => {
    // Validate input using Zod
    const parseResult = PodcastPayloadSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ ok: false, error: parseResult.error.flatten() });
    }
    try {
        const payload = parseResult.data as PodcastPayload;
        const result = await podcastEngine(payload);
        return res.json(result);
    } catch (err: any) {
        return res.status(500).json({ ok: false, error: err?.message || 'Internal error' });
    }
});

export default router;
