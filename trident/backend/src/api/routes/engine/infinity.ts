import { Router, Request, Response } from 'express';
import { Infinity } from '../../../modules/engines/infinity';

const router = Router();
const infinity = new Infinity();

router.post('/execute', async (req: Request, res: Response) => {
  try {
    const result = await infinity.execute(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
