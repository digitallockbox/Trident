import { Router, Request, Response } from 'express';
import { Eternum } from '../engine/eternum';

const router = Router();
const eternum = new Eternum();

router.post('/execute', async (req: Request, res: Response) => {
  try {
    const result = await eternum.execute(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
