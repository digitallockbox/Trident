import { Router, Request, Response } from 'express';
import { validateHybridAuthMessage } from '../middleware/validateHybridAuthMessage';
import { validateAscendState } from '../middleware/validateAscendState';

const router = Router();

router.post('/execute', validateHybridAuthMessage, validateAscendState, async (req: Request, res: Response) => {
    try {
        // Only runs if both validations pass
        // Handler receives canonical, validated state
        const result = { status: 'success', engine: 'Ascend', state: (req as any).ascendState };
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error });
    }
});

export default router;
