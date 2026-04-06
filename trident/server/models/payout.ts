// Payout data schema for Omega payout vertical slice

export interface PayoutRequest {
    wallet: string; // Solana wallet address (base58)
    amount: number; // Amount to payout (in smallest unit, e.g. lamports)
    token?: string; // Optional: token mint address (base58), default is SOL
}

export interface PayoutResponse {
    ok: boolean;
    tx?: string; // Transaction signature if successful
    error?: string; // Error message if failed
}
