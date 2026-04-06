import { Router, Request, Response } from 'express';
import { Helix } from '../../../modules/engines/helix';

const router = Router();
const helix = new Helix();

router.post('/execute', async (req: Request, res: Response) => {
  try {
    const result = await helix.execute(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
