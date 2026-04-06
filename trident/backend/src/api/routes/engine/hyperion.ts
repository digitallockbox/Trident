import { Router, Request, Response } from 'express';
import { Hyperion } from '../../../modules/engines/hyperion';

const router = Router();
const hyperion = new Hyperion();

router.post('/execute', async (req: Request, res: Response) => {
  try {
    const result = await hyperion.execute(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
