import { Router, Request, Response } from 'express';
import { Oracle } from '../engine/oracle';

const router = Router();
const oracle = new Oracle();

router.post('/execute', async (req: Request, res: Response) => {
  try {
    const result = await oracle.execute(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
