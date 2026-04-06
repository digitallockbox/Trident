import { describe, it, expect, beforeEach } from 'vitest';
import { Solaris } from '../../engine/solaris';

describe('Solaris Engine', () => {
    let solaris: Solaris;

    beforeEach(() => {
        solaris = new Solaris();
    });

    describe('allocate', () => {
        it('allocates a new resource with quota', async () => {
            const result = await solaris.execute({
                action: 'allocate',
                resource: 'compute',
                quota: 1000,
                unit: 'credits',
            });

            expect(result.status).toBe('success');
            expect(result.resource.name).toBe('compute');
            expect(result.resource.quota).toBe(1000);
            expect(result.resource.used).toBe(0);
        });

        it('rejects invalid quota', async () => {
            const result = await solaris.execute({ action: 'allocate', resource: 'x', quota: -5 });
            expect(result.status).toBe('error');
        });

        it('rejects missing resource name', async () => {
            const result = await solaris.execute({ action: 'allocate', quota: 100 });
            expect(result.status).toBe('error');
        });
    });

    describe('consume', () => {
        it('consumes from allocated resource', async () => {
            await solaris.execute({ action: 'allocate', resource: 'gpu', quota: 100 });
            const result = await solaris.execute({
                action: 'consume',
                resource: 'gpu',
                amount: 30,
                actor: 'aegis-engine',
            });

            expect(result.status).toBe('success');
            expect(result.consumed).toBe(30);
            expect(result.remaining).toBe(70);
            expect(result.utilization).toBe(30);
        });

        it('rejects consumption exceeding quota', async () => {
            await solaris.execute({ action: 'allocate', resource: 'mem', quota: 50 });
            const result = await solaris.execute({
                action: 'consume',
                resource: 'mem',
                amount: 60,
            });

            expect(result.status).toBe('error');
            expect(result.error).toBe('Quota exceeded');
        });

        it('rejects consumption of unknown resource', async () => {
            const result = await solaris.execute({ action: 'consume', resource: 'nope', amount: 1 });
            expect(result.status).toBe('error');
        });
    });

    describe('release', () => {
        it('releases consumed resources', async () => {
            await solaris.execute({ action: 'allocate', resource: 'cpu', quota: 100 });
            await solaris.execute({ action: 'consume', resource: 'cpu', amount: 40 });
            const result = await solaris.execute({ action: 'release', resource: 'cpu', amount: 20 });

            expect(result.used).toBe(20);
            expect(result.remaining).toBe(80);
        });

        it('does not go below zero', async () => {
            await solaris.execute({ action: 'allocate', resource: 'net', quota: 100 });
            await solaris.execute({ action: 'consume', resource: 'net', amount: 10 });
            const result = await solaris.execute({ action: 'release', resource: 'net', amount: 50 });

            expect(result.used).toBe(0);
        });
    });

    describe('status', () => {
        it('returns all resources', async () => {
            await solaris.execute({ action: 'allocate', resource: 'a', quota: 100 });
            await solaris.execute({ action: 'allocate', resource: 'b', quota: 200 });

            const result = await solaris.execute({ action: 'status' });

            expect(result.totalResources).toBe(2);
            expect(result.resources).toHaveLength(2);
        });

        it('returns single resource status', async () => {
            await solaris.execute({ action: 'allocate', resource: 'gpu', quota: 500, unit: 'cores' });
            const result = await solaris.execute({ action: 'status', resource: 'gpu' });

            expect(result.resource.name).toBe('gpu');
            expect(result.utilization).toBe(0);
        });
    });

    describe('usage', () => {
        it('returns usage report', async () => {
            await solaris.execute({ action: 'allocate', resource: 'compute', quota: 1000 });
            await solaris.execute({ action: 'consume', resource: 'compute', amount: 10, actor: 'user-a' });
            await solaris.execute({ action: 'consume', resource: 'compute', amount: 20, actor: 'user-b' });

            const result = await solaris.execute({ action: 'usage' });

            expect(result.totalEntries).toBe(2);
            expect(result.byActor['user-a']).toBe(10);
            expect(result.byActor['user-b']).toBe(20);
        });
    });
});
