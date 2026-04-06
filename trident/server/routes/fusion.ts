import { Router, Request, Response } from 'express';
import { Fusion } from '../engine/fusion';

const router = Router();
const fusion = new Fusion();

router.post('/execute', async (req: Request, res: Response) => {
  try {
    const result = await fusion.execute(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
