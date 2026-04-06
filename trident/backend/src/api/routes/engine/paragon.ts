import { Router, Request, Response } from 'express';
import { Paragon } from '../../../modules/engines/paragon';

const router = Router();
const paragon = new Paragon();

router.post('/execute', async (req: Request, res: Response) => {
  try {
    const result = await paragon.execute(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
