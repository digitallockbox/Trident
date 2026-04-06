import cors from 'cors';
import express from 'express';
import { env } from './core/config/env';
import { securityConfig } from './core/config/security';
import { httpRequestDurationSeconds, httpRequestsTotal } from './core/metrics/prometheus';
import { logger } from './utils/logger';

// API Routes
import healthRouter from './api/routes/health';
import metricsRouter from './api/routes/metrics';
import profileRouter from './api/routes/profile';
import claimRouter from './api/routes/claim';
import operatorRouter from './api/routes/operator/operator';
import engineRoutes from './api/routes/engine';

export const createApp = () => {
    const app = express();
    app.disable('x-powered-by');

    // CORS — merge both configs, prefer security config origins if set
    const corsOrigins = securityConfig.corsOrigins.length > 0
        ? securityConfig.corsOrigins
        : env.corsOrigin;

    app.use(cors({ origin: corsOrigins, credentials: true }));
    app.use(express.json({ limit: '1mb' }));

    // Prometheus request metrics
    app.use((req, res, next) => {
        const start = process.hrtime.bigint();

        res.on('finish', () => {
            const elapsed = Number(process.hrtime.bigint() - start) / 1_000_000_000;
            const labels = {
                method: req.method,
                path: req.path,
                status: String(res.statusCode),
            };
            httpRequestsTotal.inc(labels);
            httpRequestDurationSeconds.observe(labels, elapsed);
        });

        next();
    });

    // Routes
    app.use('/health', healthRouter);
    app.use('/metrics', metricsRouter);
    app.use('/profile', profileRouter);
    app.use('/claim', claimRouter);
    app.use('/operator', operatorRouter);
    app.use('/engine', engineRoutes);

    // Root info
    app.get('/', (_req, res) => {
        res.status(200).json({
            service: 'trident-backend',
            status: 'running',
            docs: ['/health', '/metrics'],
        });
    });

    // Global error handler
    app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        logger.error('Unhandled request error', { err });
        res.status(500).json({ error: 'internal_server_error' });
    });

    return app;
};
