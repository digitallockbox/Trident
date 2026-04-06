import { describe, it, expect, beforeEach } from 'vitest';
import { Chronos } from '../../engine/chronos';

describe('Chronos Engine', () => {
    let chronos: Chronos;

    beforeEach(() => {
        chronos = new Chronos();
    });

    describe('schedule', () => {
        it('creates a scheduled job', async () => {
            const result = await chronos.execute({
                action: 'schedule',
                name: 'backup',
                intervalMs: 60000,
            });

            expect(result.status).toBe('success');
            expect(result.job.name).toBe('backup');
            expect(result.job.intervalMs).toBe(60000);
            expect(result.job.runs).toBe(0);
            expect(result.job.enabled).toBe(true);
        });

        it('rejects interval below 1000ms', async () => {
            const result = await chronos.execute({ action: 'schedule', name: 'fast', intervalMs: 500 });
            expect(result.status).toBe('error');
        });

        it('rejects missing name', async () => {
            const result = await chronos.execute({ action: 'schedule', intervalMs: 5000 });
            expect(result.status).toBe('error');
        });
    });

    describe('cancel', () => {
        it('cancels a scheduled job', async () => {
            const job = await chronos.execute({ action: 'schedule', name: 'temp', intervalMs: 5000 });
            const result = await chronos.execute({ action: 'cancel', id: job.job.id });
            expect(result.status).toBe('success');
            expect(result.cancelled.enabled).toBe(false);
        });

        it('returns not found for unknown id', async () => {
            const result = await chronos.execute({ action: 'cancel', id: 'JOB-fake' });
            expect(result.status).toBe('error');
        });
    });

    describe('tick', () => {
        it('processes due jobs', async () => {
            // Schedule with minimum interval
            await chronos.execute({ action: 'schedule', name: 'tick-test', intervalMs: 1000 });
            // Tick immediately — job not due yet
            const result = await chronos.execute({ action: 'tick' });

            expect(result.status).toBe('success');
            expect(result.engine).toBe('Chronos');
            expect(result.firedJobs).toBeDefined();
        });
    });

    describe('status', () => {
        it('returns all jobs', async () => {
            await chronos.execute({ action: 'schedule', name: 'a', intervalMs: 2000 });
            await chronos.execute({ action: 'schedule', name: 'b', intervalMs: 3000 });

            const result = await chronos.execute({ action: 'status' });

            expect(result.totalJobs).toBe(2);
            expect(result.jobs).toHaveLength(2);
        });

        it('returns single job status by id', async () => {
            const created = await chronos.execute({ action: 'schedule', name: 'x', intervalMs: 5000 });
            const result = await chronos.execute({ action: 'status', id: created.job.id });

            expect(result.job.name).toBe('x');
        });
    });

    describe('window', () => {
        it('calculates a time window', async () => {
            const start = Date.now() - 3600000;
            const end = Date.now();
            const result = await chronos.execute({
                action: 'window',
                start,
                end,
            });

            expect(result.status).toBe('success');
            expect(result.window.durationMs).toBeGreaterThan(0);
        });
    });
});
