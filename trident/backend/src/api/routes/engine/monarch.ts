import { Router, Request, Response } from 'express';
import { Monarch } from '../../../modules/engines/monarch';

const router = Router();
const monarch = new Monarch();

router.post('/execute', async (req: Request, res: Response) => {
  try {
    const result = await monarch.execute(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
