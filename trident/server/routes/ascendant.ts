import { Router, Request, Response } from 'express';
import { Ascendant } from '../engine/ascendant';
import { validateHybridAuthMessage } from '../middleware/validateHybridAuthMessage';

const router = Router();
const ascendant = new Ascendant();

// Example: to require hybrid auth message validation, add as middleware
// router.post('/execute', validateHybridAuthMessage, async (req: Request, res: Response) => {
//   try {
//     const result = await ascendant.execute((req as any).hybridAuthMessage);
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ error: error });
//   }
// });

router.post('/execute', async (req: Request, res: Response) => {
  try {
    const result = await ascendant.execute(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
