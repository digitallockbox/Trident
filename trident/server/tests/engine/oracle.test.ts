import { describe, it, expect, beforeEach } from 'vitest';
import { Oracle } from '../../engine/oracle';

describe('Oracle Engine', () => {
    let oracle: Oracle;

    beforeEach(() => {
        oracle = new Oracle();
    });

    describe('ingest', () => {
        it('ingests data points', async () => {
            const result = await oracle.execute({
                action: 'ingest',
                series: 'cpu',
                points: [
                    { value: 10 },
                    { value: 20 },
                    { value: 30 },
                ],
            });

            expect(result.status).toBe('success');
            expect(result.ingested).toBe(3);
            expect(result.total).toBe(3);
        });

        it('rejects missing series name', async () => {
            const result = await oracle.execute({ action: 'ingest', points: [{ value: 1 }] });
            expect(result.status).toBe('error');
        });

        it('skips invalid points', async () => {
            const result = await oracle.execute({
                action: 'ingest',
                series: 'test',
                points: [{ value: 10 }, { value: 'bad' }, { value: NaN }],
            });

            expect(result.ingested).toBe(1);
        });
    });

    describe('forecast', () => {
        it('forecasts future values', async () => {
            await oracle.execute({
                action: 'ingest',
                series: 'linear',
                points: [
                    { value: 10, timestamp: 1 },
                    { value: 20, timestamp: 2 },
                    { value: 30, timestamp: 3 },
                    { value: 40, timestamp: 4 },
                    { value: 50, timestamp: 5 },
                ],
            });

            const result = await oracle.execute({
                action: 'forecast',
                series: 'linear',
                steps: 3,
            });

            expect(result.forecast).toHaveLength(3);
            // Linear data should produce increasing forecasts
            expect(result.forecast[0].predicted).toBeGreaterThan(40);
        });

        it('returns empty forecast for insufficient data', async () => {
            await oracle.execute({
                action: 'ingest',
                series: 'tiny',
                points: [{ value: 1 }, { value: 2 }],
            });

            const result = await oracle.execute({ action: 'forecast', series: 'tiny' });
            expect(result.forecast).toHaveLength(0);
        });
    });

    describe('trend', () => {
        it('detects upward trend', async () => {
            await oracle.execute({
                action: 'ingest',
                series: 'up',
                points: Array.from({ length: 10 }, (_, i) => ({ value: i * 10 })),
            });

            const result = await oracle.execute({ action: 'trend', series: 'up' });

            expect(result.trend).toBe('rising');
            expect(result.percentChange).toBeGreaterThan(0);
        });

        it('detects downward trend', async () => {
            await oracle.execute({
                action: 'ingest',
                series: 'down',
                points: Array.from({ length: 10 }, (_, i) => ({ value: 100 - i * 10 })),
            });

            const result = await oracle.execute({ action: 'trend', series: 'down' });
            expect(result.trend).toBe('falling');
        });
    });

    describe('probability', () => {
        it('estimates probability of exceeding threshold', async () => {
            await oracle.execute({
                action: 'ingest',
                series: 'vals',
                points: Array.from({ length: 20 }, (_, i) => ({ value: i })),
            });

            const result = await oracle.execute({
                action: 'probability',
                series: 'vals',
                threshold: 10,
            });

            expect(result.probability).toBeDefined();
            expect(result.probability).toBeGreaterThan(0);
            expect(result.probability).toBeLessThanOrEqual(1);
        });
    });
});
