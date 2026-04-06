import { describe, it, expect, beforeEach } from 'vitest';
import { Overwatch } from '../../engine/overwatch';

describe('Overwatch Engine', () => {
    let overwatch: Overwatch;

    beforeEach(() => {
        overwatch = new Overwatch();
    });

    describe('ping', () => {
        it('records a ping for an engine', async () => {
            const result = await overwatch.execute({ action: 'ping', engine: 'aegis', latency: 15 });
            expect(result.status).toBe('success');
            expect(result.engine).toBe('Overwatch');
            expect(result.recorded.engine).toBe('aegis');
            expect(result.recorded.status).toBe('online');
        });

        it('marks high-latency engine as degraded', async () => {
            const result = await overwatch.execute({ action: 'ping', engine: 'slow', latency: 600 });
            expect(result.recorded.status).toBe('degraded');
        });

        it('marks errored engine as offline', async () => {
            const result = await overwatch.execute({ action: 'ping', engine: 'dead', error: true });
            expect(result.recorded.status).toBe('offline');
        });

        it('rejects missing engine name', async () => {
            const result = await overwatch.execute({ action: 'ping' });
            expect(result.status).toBe('error');
        });
    });

    describe('incident', () => {
        it('creates and resolves an incident', async () => {
            const created = await overwatch.execute({
                action: 'incident',
                engine: 'prime',
                severity: 'critical',
                message: 'CPU spike',
            });

            expect(created.status).toBe('success');
            expect(created.incident).toBeDefined();
            expect(created.incident.resolved).toBe(false);

            const resolved = await overwatch.execute({
                action: 'resolve',
                id: created.incident.id,
            });

            expect(resolved.status).toBe('success');
        });
    });

    describe('report', () => {
        it('returns platform monitoring report', async () => {
            await overwatch.execute({ action: 'ping', engine: 'aegis', latency: 10 });
            await overwatch.execute({ action: 'ping', engine: 'nexus', latency: 20 });

            const result = await overwatch.execute({ action: 'report' });

            expect(result.status).toBe('success');
            expect(result.summary.totalEngines).toBe(2);
            expect(result.summary.online).toBe(2);
        });
    });

    describe('status', () => {
        it('returns status for a specific engine', async () => {
            await overwatch.execute({ action: 'ping', engine: 'aegis', latency: 5 });
            const result = await overwatch.execute({ action: 'status', engine: 'aegis' });

            expect(result.state.status).toBe('online');
        });

        it('returns unknown for unmonitored engine', async () => {
            const result = await overwatch.execute({ action: 'status', engine: 'ghost' });
            expect(result.state.status).toBe('unknown');
        });
    });
});
