import type { Payout } from '../schemas/payout.schema';

const payouts: Payout[] = [];

export const PayoutsRepo = {
    async create(payout: Omit<Payout, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payout> {
        const newPayout: Payout = {
            ...payout,
            id: Math.random().toString(36).slice(2),
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'pending',
        };
        payouts.push(newPayout);
        return newPayout;
    },
    async findById(id: string): Promise<Payout | undefined> {
        return payouts.find(p => p.id === id);
    },
    async updateStatus(id: string, status: Payout['status']): Promise<void> {
        const payout = payouts.find(p => p.id === id);
        if (payout) {
            payout.status = status;
            payout.updatedAt = new Date();
        }
    },
};
