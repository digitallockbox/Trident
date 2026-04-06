import { Router, Request, Response } from 'express';
import { Genesis } from '../../../modules/engines/genesis';

const router = Router();
const genesis = new Genesis();

router.post('/execute', async (req: Request, res: Response) => {
  try {
    const result = await genesis.execute(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
