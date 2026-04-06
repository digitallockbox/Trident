
import { Router, Response } from 'express';
import { Paragon } from '../engine/paragon';
import { hybridAuthPipeline, HybridAuthRequest } from '../middleware/hybridAuthPipeline';


const router = Router();
const paragon = new Paragon();



// Full hybrid auth pipeline: input validation, replay protection, Solana signature verification
router.post(
  '/execute',
  hybridAuthPipeline,
  async (req: HybridAuthRequest, res: Response) => {
    try {
      if (!req.hybridAuthMessage) {
        return res.status(400).json({ ok: false, error: 'Missing hybridAuthMessage' });
      }
      // Only pass the business fields to Paragon, not auth fields
      const { field1, field2 } = req.hybridAuthMessage;
      const result = await paragon.execute({ field1, field2 });
      return res.json({ ok: true, result });
    } catch (err: any) {
      const message =
        err?.message ||
        err?.toString() ||
        'Internal error during Paragon execution';
      return res.status(500).json({ ok: false, error: message });
    }
  }
);

export default router;
