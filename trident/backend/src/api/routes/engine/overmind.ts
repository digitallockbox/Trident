import { Router, Request, Response } from 'express';
import { Overmind } from '../../../modules/engines/overmind';

const router = Router();
const overmind = new Overmind();

router.post('/execute', async (req: Request, res: Response) => {
  try {
    const result = await overmind.execute(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
