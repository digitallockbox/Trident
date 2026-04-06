import { Router, Request, Response } from 'express';
import { Overwatch } from '../../../modules/engines/overwatch';

const router = Router();
const overwatch = new Overwatch();

router.post('/execute', async (req: Request, res: Response) => {
  try {
    const result = await overwatch.execute(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
