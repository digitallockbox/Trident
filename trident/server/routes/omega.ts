import { Router, Request, Response } from 'express';
import { Omega } from '../engine/omega';
import { validateHybridAuthMessage } from '../middleware/validateHybridAuthMessage';
import { validateOmegaPayoutRequest } from '../middleware/validateOmegaPayoutRequest';

const router = Router();
const omega = new Omega();

router.post(
  '/execute',
  validateHybridAuthMessage,
  validateOmegaPayoutRequest,
  async (req: Request, res: Response) => {
    try {
      const result = await omega.execute((req as any).omegaPayoutRequest);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }
);

export default router;
