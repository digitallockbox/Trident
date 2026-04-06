// aegis.engine.test.ts
// Unit test for AegisEngine using Jest

import { AegisEngine } from '@trident/internal-aegis/src/engine';
import { AegisPayload, AegisResult, AegisContract } from '../contracts/aegis.contract';
import { runEngine } from '../orchestrator';

describe('AegisEngine', () => {
    it('should process valid payload and return valid result', async () => {
        const engine = new AegisEngine();
        const payload: AegisPayload = { text: 'sample', mode: 'analyze' };
        const result = await runEngine(engine, payload);
        const parsed = AegisContract.result.safeParse(result);
        expect(parsed.success).toBe(true);
        expect(result).toHaveProperty('verdict');
        expect(result).toHaveProperty('confidence');
    });

    it('should fail validation for invalid payload', async () => {
        // @ts-expect-error: purposely invalid
        const payload = { text: '' };
        const parsed = AegisContract.payload.safeParse(payload);
        expect(parsed.success).toBe(false);
    });
});
