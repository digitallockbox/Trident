import { Router, Request, Response } from 'express';
import { Aegis } from '../engine/aegis';

const router = Router();
const aegis = new Aegis();

router.post('/execute', async (req: Request, res: Response) => {
  try {
    const result = await aegis.execute(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
