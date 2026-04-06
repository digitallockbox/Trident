import { Router, Request, Response } from 'express';
import { SentinelV2 } from '../../../modules/engines/sentinelV2';

const router = Router();
const sentinel = new SentinelV2();

router.post('/execute', async (req: Request, res: Response) => {
  try {
    const result = await sentinel.execute(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
