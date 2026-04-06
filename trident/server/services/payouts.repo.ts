import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export interface PayoutRecord {
    id: string;
    tenant: string;
    from_wallet: string;
    to_wallet: string;
    amount: number;
    token_mint: string;
    tx_signature: string;
    status: 'submitted' | 'confirmed' | 'failed';
    created_at: Date;
    confirmed_at: Date | null;
    last_checked_at: Date | null;
    check_attempts: number;
    error: string | null;
}

export async function getPayoutById(id: string): Promise<PayoutRecord | null> {
    const { rows } = await pool.query('SELECT * FROM payouts WHERE id = $1', [id]);
    return rows[0] || null;
}
