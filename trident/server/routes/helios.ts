import { Router, Request, Response } from 'express';
import { Helios } from '../engine/helios';

const router = Router();
const helios = new Helios();

router.post('/execute', async (req: Request, res: Response) => {
  try {
    const result = await helios.execute(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
