import { Router, Request, Response } from 'express';
import { Keystone } from '../engine/keystone';

const router = Router();
const keystone = new Keystone();

router.post('/execute', async (req: Request, res: Response) => {
    try {
        const result = await keystone.execute(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error });
    }
});

export default router;
