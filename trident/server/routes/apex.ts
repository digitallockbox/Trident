import { Router, Request, Response } from 'express';
import { Apex } from '../engine/apex';
import { validateHybridAuthMessage } from '../middleware/validateHybridAuthMessage';
import { validateApexState } from '../middleware/validateApexState';

const router = Router();
const apex = new Apex();

router.post(
  '/execute',
  validateHybridAuthMessage,
  validateApexState,
  async (req: Request, res: Response) => {
    try {
      const result = await apex.execute((req as any).apexState);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }
);

export default router;
