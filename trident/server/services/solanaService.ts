// Solana Integration Starter Kit
import { Connection, Keypair, Transaction, PublicKey } from '@solana/web3.js';
import fs from 'fs';

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const SOLANA_KEYPAIR = process.env.SOLANA_KEYPAIR || '';

export const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

export function loadKeypair(): Keypair {
    if (!SOLANA_KEYPAIR) throw new Error('SOLANA_KEYPAIR env var not set');
    const secret = JSON.parse(fs.readFileSync(SOLANA_KEYPAIR, 'utf8'));
    return Keypair.fromSecretKey(new Uint8Array(secret));
}

export async function sendTransaction(tx: Transaction, signers: Keypair[]) {
    const signature = await connection.sendTransaction(tx, signers);
    await connection.confirmTransaction(signature, 'confirmed');
    return signature;
}

export async function getProgramAccounts(programId: string) {
    return connection.getProgramAccounts(new PublicKey(programId));
}
