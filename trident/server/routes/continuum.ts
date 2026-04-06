import { Router, Request, Response } from 'express';
import { Continuum } from '../engine/continuum';

const router = Router();
const continuum = new Continuum();

router.post('/execute', async (req: Request, res: Response) => {
  try {
    const result = await continuum.execute(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
