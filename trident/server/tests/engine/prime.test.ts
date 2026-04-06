import { describe, it, expect, beforeEach } from 'vitest';
import { Prime } from '../../engine/prime';

describe('Prime Engine', () => {
    let prime: Prime;

    beforeEach(() => {
        prime = new Prime();
    });

    describe('diagnostics', () => {
        it('returns system diagnostics', async () => {
            const result = await prime.execute({ action: 'diagnostics' });

            expect(result.status).toBe('success');
            expect(result.engine).toBe('Prime');
            expect(result.diagnostics.uptime.ms).toBeGreaterThanOrEqual(0);
            expect(result.diagnostics.memory.heapUsed).toBeGreaterThan(0);
            expect(result.diagnostics.node).toMatch(/^v/);
            expect(result.diagnostics.pid).toBe(process.pid);
        });

        it('defaults to diagnostics action', async () => {
            const result = await prime.execute({});
            expect(result.diagnostics).toBeDefined();
        });
    });

    describe('config', () => {
        it('sets and gets a config value', async () => {
            await prime.execute({ action: 'config', op: 'set', key: 'theme', value: 'dark' });
            const result = await prime.execute({ action: 'config', op: 'get', key: 'theme' });

            expect(result.value).toBe('dark');
        });

        it('returns null for missing key', async () => {
            const result = await prime.execute({ action: 'config', op: 'get', key: 'nope' });
            expect(result.value).toBeNull();
        });

        it('lists all config without key', async () => {
            await prime.execute({ action: 'config', op: 'set', key: 'a', value: 1 });
            await prime.execute({ action: 'config', op: 'set', key: 'b', value: 2 });

            const result = await prime.execute({ action: 'config', op: 'get' });
            expect(result.config).toEqual({ a: 1, b: 2 });
        });

        it('deletes a config key', async () => {
            await prime.execute({ action: 'config', op: 'set', key: 'x', value: 'y' });
            const del = await prime.execute({ action: 'config', op: 'delete', key: 'x' });
            expect(del.deleted).toBe(true);

            const get = await prime.execute({ action: 'config', op: 'get', key: 'x' });
            expect(get.value).toBeNull();
        });
    });

    describe('heartbeat', () => {
        it('records heartbeat from source', async () => {
            const result = await prime.execute({ action: 'heartbeat', source: 'aegis' });

            expect(result.received).toBe(true);
            expect(result.source).toBe('aegis');
            expect(result.totalHeartbeats).toBe(1);
        });

        it('tracks multiple heartbeats', async () => {
            await prime.execute({ action: 'heartbeat', source: 'a' });
            await prime.execute({ action: 'heartbeat', source: 'b' });
            const result = await prime.execute({ action: 'heartbeat', source: 'c' });

            expect(result.totalHeartbeats).toBe(3);
        });
    });

    describe('health', () => {
        it('aggregates engine health', async () => {
            const result = await prime.execute({
                action: 'health',
                engines: [
                    { name: 'aegis', status: 'healthy' },
                    { name: 'nexus', status: 'healthy' },
                    { name: 'solaris', status: 'degraded' },
                ],
            });

            expect(result.healthScore).toBeGreaterThan(50);
            expect(result.summary.healthy).toBe(2);
            expect(result.summary.degraded).toBe(1);
            expect(result.grade).toBeDefined();
        });

        it('handles empty engine list', async () => {
            const result = await prime.execute({ action: 'health', engines: [] });
            expect(result.summary.total).toBe(0);
        });
    });
});
