import { describe, it, expect } from 'vitest';
import { PayoutsService } from '../backend/services/payouts.service';

describe('Omega payout flow', () => {
    it('creates a payout and marks as completed', async () => {
        const payout = await PayoutsService.requestPayout('tenant1', 'wallet1', 100);
        expect(payout.amount).toBe(100);
        expect(payout.status).toBe('pending');
        await PayoutsService.markCompleted(payout.id);
        const updated = await PayoutsService.getPayout(payout.id);
        expect(updated?.status).toBe('completed');
    });
});
