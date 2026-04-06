import request from 'supertest';
import express from 'express';
import conduitRouter from '../../routes/conduit';
import { describe, it, expect, vi } from 'vitest';

// Mock Conduit engine if needed
// vi.mock('../../engine/conduit', ...)

describe('POST /conduit/execute', () => {
    const app = express();
    app.use(express.json());
    app.use('/conduit', conduitRouter);

    it('should return error for missing body', async () => {
        const res = await request(app).post('/conduit/execute').send();
        expect(res.status).toBe(200); // Conduit returns error in body, not HTTP error
        expect(res.body.status).toBe('error');
    });

    it('should register a split rule', async () => {
        const payload = {
            action: 'registerRule',
            name: 'Test Rule',
            shares: [
                { party: 'alice', role: 'creator', percent: 60 },
                { party: 'bob', role: 'affiliate', percent: 40 }
            ]
        };
        const res = await request(app).post('/conduit/execute').send(payload);
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.rule).toBeDefined();
        expect(res.body.rule.shares.length).toBe(2);
    });

    it('should capture revenue and split', async () => {
        // Register rule first
        const ruleRes = await request(app).post('/conduit/execute').send({
            action: 'registerRule',
            name: 'SplitTest',
            shares: [
                { party: 'alice', role: 'creator', percent: 70 },
                { party: 'bob', role: 'affiliate', percent: 30 }
            ]
        });
        const ruleId = ruleRes.body.rule.id;
        // Capture revenue
        const captureRes = await request(app).post('/conduit/execute').send({
            action: 'capture',
            ruleId,
            amount: 100,
            source: 'test',
            creator: 'alice'
        });
        expect(captureRes.status).toBe(200);
        expect(captureRes.body.status).toBe('success');
        expect(captureRes.body.splits.length).toBe(2);
        expect(captureRes.body.splits[0].amount + captureRes.body.splits[1].amount).toBeCloseTo(100);
    });

    it('should return error for invalid split rule', async () => {
        const res = await request(app).post('/conduit/execute').send({
            action: 'capture',
            ruleId: 'nonexistent',
            amount: 50
        });
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('error');
    });
});
