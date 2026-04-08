// engineRouter.int.test.ts
// Integration test for the engineRouter using supertest and Jest

import request from 'supertest';
import express from 'express';
import { engineRouter } from '../src/routes/engineRouter';

describe('EngineRouter Integration', () => {
    const app = express();
    app.disable('x-powered-by');
    app.use(express.json());
    app.use('/engines', engineRouter);

    it('should execute Omega engine with valid payload', async () => {
        const res = await request(app)
            .post('/engines/omega')
            .send({ input: 'integration-test' });
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.engine).toBe('omega');
        expect(res.body.result).toHaveProperty('output');
    });

    it('should return 400 for invalid Omega payload', async () => {
        const res = await request(app)
            .post('/engines/omega')
            .send({ input: '' });
        expect(res.status).toBe(400);
        expect(res.body.ok).toBe(false);
        expect(res.body.error).toBe('Invalid payload');
    });

    it('should return 404 for unknown engine', async () => {
        const res = await request(app)
            .post('/engines/unknown')
            .send({});
        expect(res.status).toBe(404);
        expect(res.body.ok).toBe(false);
    });
});
