import request from 'supertest';
import express from 'express';
import paragonRouter from '../../routes/paragon';

describe('Paragon Engine Route', () => {
    const app = express();
    app.use(express.json());
    app.use('/paragon', paragonRouter);

    it('should reject invalid body', async () => {
        const res = await request(app).post('/paragon/execute').send(null);
        expect(res.status).toBe(400);
        expect(res.body.ok).toBe(false);
    });

    it('should handle unknown action', async () => {
        const res = await request(app).post('/paragon/execute').send({ action: 'unknown' });
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.result.status).toBe('error');
    });

    // Add more tests for defineSchema, validate, grade, etc.
});
