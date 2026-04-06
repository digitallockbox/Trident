import { Router, Request, Response } from 'express';
import { Nexus2 } from '../engine/nexus2';

const router = Router();
const nexus2 = new Nexus2();

router.post('/execute', async (req: Request, res: Response) => {
  try {
    const result = await nexus2.execute(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
