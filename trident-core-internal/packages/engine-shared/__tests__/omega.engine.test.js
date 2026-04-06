// omega.engine.test.ts
// Unit test for OmegaEngine using Jest
import { OmegaEngine } from '@trident/internal-omega/src/engine';
import { OmegaContract } from '../contracts/omega.contract';
import { runEngine } from '../orchestrator';
describe('OmegaEngine', () => {
    it('should process valid payload and return valid result', async () => {
        const engine = new OmegaEngine();
        const payload = { input: 'test-input' };
        const result = await runEngine(engine, payload);
        // Validate result shape
        const parsed = OmegaContract.result.safeParse(result);
        expect(parsed.success).toBe(true);
        // Optionally, check result content
        expect(result).toHaveProperty('output');
        expect(result).toHaveProperty('meta');
    });
    it('should fail validation for invalid payload', async () => {
        // @ts-expect-error: purposely invalid
        const payload = { input: '' };
        const parsed = OmegaContract.payload.safeParse(payload);
        expect(parsed.success).toBe(false);
    });
});
