import { Router, Request, Response } from 'express';
import { Sovereign } from '../../../modules/engines/sovereign';

const router = Router();
const sovereign = new Sovereign();

router.post('/execute', async (req: Request, res: Response) => {
  try {
    const result = await sovereign.execute(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
