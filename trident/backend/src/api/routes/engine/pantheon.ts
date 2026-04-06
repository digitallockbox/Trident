import { Router, Request, Response } from 'express';
import { Pantheon } from '../../../modules/engines/pantheon';

const router = Router();
const pantheon = new Pantheon();

router.post('/execute', async (req: Request, res: Response) => {
  try {
    const result = await pantheon.execute(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
