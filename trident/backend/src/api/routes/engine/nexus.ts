import { Router, Request, Response } from 'express';
import { Nexus } from '../../../modules/engines/nexus';

const router = Router();
const nexus = new Nexus();

router.post('/execute', async (req: Request, res: Response) => {
  try {
    const result = await nexus.execute(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
