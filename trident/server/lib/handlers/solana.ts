import { Connection, Keypair, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction } from '@solana/web3.js';
import { Handler } from '../router';

// Example: Use devnet for demonstration
const connection = new Connection('https://api.devnet.solana.com');

// This would be replaced with your real key management
const FEE_PAYER = Keypair.generate();

export const gasless: Handler = async (req, res) => {
  try {
    const { from, to, amount, metadata } = req.body;
    // In production, validate and parse all inputs
    const fromPubkey = new PublicKey(from);
    const toPubkey = new PublicKey(to);
    const lamports = Number(amount); // 1 SOL = 1_000_000_000 lamports

    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: FEE_PAYER.publicKey, // Fee payer covers the fee
        toPubkey,
        lamports,
      })
    );

    const signature = await sendAndConfirmTransaction(connection, tx, [FEE_PAYER]);
    res.json({ ok: true, signature });
  } catch (e) {
    res.statusCode = 500;
    res.json({ ok: false, error: e.message });
  }
};
