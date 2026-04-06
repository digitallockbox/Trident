import { Router, Request, Response } from 'express';
import { Omega } from '../../../modules/engines/omega';

const router = Router();
const omega = new Omega();

router.post('/execute', async (req: Request, res: Response) => {
  try {
    const result = await omega.execute(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
