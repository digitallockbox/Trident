import request from 'supertest';
import express from 'express';
import paragonRouter from '../../routes/paragon';
import { describe, it, expect, vi } from 'vitest';

// Mock Paragon engine
vi.mock('../../engine/paragon', () => {
    return {
        Paragon: vi.fn().mockImplementation(() => ({
            execute: vi.fn(async (input) => ({ echo: input }))
        }))
    };
});

describe('POST /execute (paragon)', () => {
    const app = express();
    app.use(express.json());
    app.use('/paragon', paragonRouter);

    it('should return 400 for missing body', async () => {
        const res = await request(app).post('/paragon/execute').send();
        expect(res.status).toBe(400);
        expect(res.body.ok).toBe(false);
        expect(res.body.error).toMatch(/invalid/i);
    });

    it('should return 400 for non-object body', async () => {
        const res = await request(app)
            .post('/paragon/execute')
            .send('string');
        expect(res.status).toBe(400);
        expect(res.body.ok).toBe(false);
    });

    it('should return ok:true and echo result for valid object', async () => {
        const payload = { foo: 'bar' };
        const res = await request(app)
            .post('/paragon/execute')
            .send(payload);
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.result).toEqual({ echo: payload });
    });

    it('should handle engine errors gracefully', async () => {
        // Patch Paragon.execute to throw
        const { Paragon } = await import('../../engine/paragon');
        Paragon.prototype.execute = vi.fn(async () => { throw new Error('fail!'); });
        const res = await request(app)
            .post('/paragon/execute')
            .send({ foo: 'bar' });
        expect(res.status).toBe(500);
        expect(res.body.ok).toBe(false);
        expect(res.body.error).toMatch(/fail!/i);
    });
});
