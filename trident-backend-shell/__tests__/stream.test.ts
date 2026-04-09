
import request from 'supertest';
import express from 'express';
import { streamRoutes } from '../src/routes/stream.routes';
import { PrismaClient } from '@prisma/client';

describe('Stream Lifecycle + Omega Integration', () => {
    const app = express();
    app.use(express.json());
    app.use('/streams', streamRoutes);

    const prisma = new PrismaClient();
    let streamId: string;

    beforeAll(async () => {
        await prisma.stream.deleteMany({});
    });

    afterAll(async () => {
        await prisma.stream.deleteMany({});
        await prisma.$disconnect();
    });

    it('should create a stream', async () => {
        const res = await request(app)
            .post('/streams/create')
            .send({ creatorId: 'test', title: 'Test Stream', category: 'Demo' });
        expect(res.status).toBe(200);
        expect(res.body.streamId).toBeDefined();
        streamId = res.body.streamId;
    });

    it('should go live', async () => {
        const res = await request(app)
            .post('/streams/go-live')
            .send({ streamId });
        expect(res.status).toBe(200);
        expect(res.body.stream.status).toBe('LIVE');
    });

    it('should run Omega engine for the stream', async () => {
        const omegaPayload = { numbers: [2, 3, 4], operation: 'product' };
        const res = await request(app)
            .post('/streams/omega')
            .send({ streamId, omegaPayload });
        expect(res.status).toBe(200);
        expect(res.body.result.status).toBe('success');
        expect(res.body.result.result).toBe(24);
    });

    it('should end the stream', async () => {
        const res = await request(app)
            .post('/streams/end')
            .send({ streamId });
        expect(res.status).toBe(200);
        expect(res.body.stream.status).toBe('ENDED');
    });

    it('should handle missing payloads gracefully', async () => {
        const res = await request(app)
            .post('/streams/omega')
            .send({});
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });
});
