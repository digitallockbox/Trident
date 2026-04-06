// overwatch.engine.test.ts
// Unit test for OverwatchEngine using Jest

import { OverwatchEngine } from '@trident/internal-overwatch/src/engine';
import { OverwatchPayload, OverwatchResult, OverwatchContract } from '../contracts/overwatch.contract';
import { runEngine } from '../orchestrator';

describe('OverwatchEngine', () => {
    it('should process valid payload and return valid result', async () => {
        const engine = new OverwatchEngine();
        const payload: OverwatchPayload = { target: 'target-1', depth: 2 };
        const result = await runEngine(engine, payload);
        const parsed = OverwatchContract.result.safeParse(result);
        expect(parsed.success).toBe(true);
        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('details');
    });

    it('should fail validation for invalid payload', async () => {
        // @ts-expect-error: purposely invalid
        const payload = { target: '', depth: 0 };
        const parsed = OverwatchContract.payload.safeParse(payload);
        expect(parsed.success).toBe(false);
    });
});
