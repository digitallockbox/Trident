// Payout schema (TypeScript type)
export interface Payout {
    id: string;
    tenant: string;
    wallet: string;
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    createdAt: Date;
    updatedAt: Date;
}
