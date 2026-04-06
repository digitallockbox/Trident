import { Router, Request, Response } from 'express';
import { Conduit } from '../engine/conduit';

const router = Router();
const conduit = new Conduit();

router.post('/execute', async (req: Request, res: Response) => {
    try {
        const result = await conduit.execute(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error });
    }
});

export default router;
