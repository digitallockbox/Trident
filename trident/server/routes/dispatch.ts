import { Router, Request, Response } from 'express';
import { Dispatch } from '../engine/dispatch';

const router = Router();
const dispatch = new Dispatch();

router.post('/execute', async (req: Request, res: Response) => {
    try {
        const result = await dispatch.execute(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error });
    }
});

export default router;
