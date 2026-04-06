/**
 * Payout status enum - matches backend Prisma enum
 */
export enum PayoutStatus {
    Pending = 'PENDING',
    Processing = 'PROCESSING',
    Completed = 'COMPLETED',
    Failed = 'FAILED',
    Cancelled = 'CANCELLED',
}

/**
 * Payout entity representing a user's reward transaction
 * Synced from backend Prisma schema
 */
export interface Payout {
    id: string;
    userId: string;
    amount: string; // Decimal as string (18,8 precision)
    tokenMint: string;
    txSignature: string | null;
    status: PayoutStatus;
    cycleId: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Claim request payload sent from frontend to /claim endpoint
 */
export interface ClaimPayload {
    cycleId: string;
    amount: string;
}

/**
 * Claim response from backend after successful claim
 */
export interface ClaimResponse {
    success: boolean;
    payout: Payout;
    txSignature: string;
}
