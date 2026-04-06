import { PayoutsRepo } from '../../data/repositories/payouts.repo';
import type { Payout } from '../../data/schemas/payout.schema';

export const PayoutsService = {
    async requestPayout(tenant: string, wallet: string, amount: number): Promise<Payout> {
        // Business logic: validate, check limits, etc.
        if (amount <= 0) throw new Error('Amount must be positive');
        // Create payout record
        return await PayoutsRepo.create({ tenant, wallet, amount, status: 'pending' });
    },
    async getPayout(id: string): Promise<Payout | undefined> {
        return await PayoutsRepo.findById(id);
    },
    async markCompleted(id: string): Promise<void> {
        await PayoutsRepo.updateStatus(id, 'completed');
    },
};
