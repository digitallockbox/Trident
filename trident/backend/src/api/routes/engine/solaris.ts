import { Router, Request, Response } from 'express';
import { Solaris } from '../../../modules/engines/solaris';

const router = Router();
const solaris = new Solaris();

router.post('/execute', async (req: Request, res: Response) => {
  try {
    const result = await solaris.execute(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
