import { Router, Request, Response } from 'express';
import { Chronos } from '../../../modules/engines/chronos';

const router = Router();
const chronos = new Chronos();

router.post('/execute', async (req: Request, res: Response) => {
  try {
    const result = await chronos.execute(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
