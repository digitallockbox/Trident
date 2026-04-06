import { Router } from 'express';
import { metricsRegistry } from '../../core/metrics/prometheus';

const router = Router();

router.get('/', async (_req, res, next) => {
    try {
        res.set('Content-Type', metricsRegistry.contentType);
        res.end(await metricsRegistry.metrics());
    } catch (error) {
        next(error);
    }
});

export default router;
