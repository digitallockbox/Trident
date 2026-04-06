import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Import engine routes
import aegisRouter from './engines/aegis/route';
import paragonRouter from './engines/paragon/route';
import apexRouter from './engines/apex/route';
import omegaRouter from './engines/omega/route';
import primeRouter from './engines/prime/route';
import podcastRouter from './engines/podcast/route';
// ...import other engine routers as needed

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
}));

// Engine API routes
app.use('/api/aegis', aegisRouter);
app.use('/api/paragon', paragonRouter);
app.use('/api/apex', apexRouter);
app.use('/api/omega', omegaRouter);
app.use('/api/prime', primeRouter);
app.use('/api/podcast', podcastRouter);
// ...add other engine routes here

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true, status: 'backend-ready' }));

// 404 handler
app.use((req, res) => res.status(404).json({ ok: false, error: 'Not found' }));

export default app;
