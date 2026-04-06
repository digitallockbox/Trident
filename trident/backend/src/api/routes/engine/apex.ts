import { Router, Request, Response } from 'express';
import { Apex } from '../../../modules/engines/apex';

const router = Router();
const apex = new Apex();

router.post('/execute', async (req: Request, res: Response) => {
  try {
    const result = await apex.execute(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
