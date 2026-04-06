import { Router, Request, Response } from 'express';
import { Prime } from '../../../modules/engines/prime';

const router = Router();
const prime = new Prime();

router.post('/execute', async (req: Request, res: Response) => {
  try {
    const result = await prime.execute(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
