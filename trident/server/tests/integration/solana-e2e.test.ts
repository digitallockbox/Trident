// First End-to-End Test Script for Solana Integration
import { describe, it, expect } from 'vitest';
import { connection, loadKeypair, sendTransaction } from '../../services/solanaService';
import { Transaction, SystemProgram } from '@solana/web3.js';

// This test assumes a funded keypair and a working RPC endpoint

describe('Solana Integration E2E', () => {
    it('sends a simple transfer transaction', async () => {
        const payer = loadKeypair();
        const recipient = payer.publicKey; // For demo, send to self
        const tx = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: payer.publicKey,
                toPubkey: recipient,
                lamports: 1000, // Smallest unit
            })
        );
        const sig = await sendTransaction(tx, [payer]);
        expect(typeof sig).toBe('string');
        // Optionally, confirm transaction
        const conf = await connection.getConfirmedTransaction(sig);
        expect(conf).toBeTruthy();
    });
});
