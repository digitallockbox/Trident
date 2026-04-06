import { Router, Request, Response } from 'express';
import { Ascendant } from '../../../modules/engines/ascendant';

const router = Router();
const ascendant = new Ascendant();

router.post('/execute', async (req: Request, res: Response) => {
  try {
    const result = await ascendant.execute(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
