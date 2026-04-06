import { Connection, PublicKey, Keypair, SystemProgram, Transaction, Token, TOKEN_PROGRAM_ID } from '@solana/web3.js';

const connection = new Connection(process.env.SOLANA_RPC_URL as string, 'confirmed');
// TODO: Load treasury keypair securely
const treasury = Keypair.generate(); // placeholder

export async function sendNativePayout(toWallet: string, lamports: number): Promise<string> {
    const toPubkey = new PublicKey(toWallet);
    const tx = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: treasury.publicKey,
            toPubkey,
            lamports,
        })
    );
    const sig = await connection.sendTransaction(tx, [treasury]);
    return sig;
}

export async function sendSplTokenPayout(toWallet: string, amount: number, tokenMint: string): Promise<string> {
    const toPubkey = new PublicKey(toWallet);
    const mintPubkey = new PublicKey(tokenMint);
    // Find or create associated token account for recipient
    const { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction, TOKEN_PROGRAM_ID } = await import('@solana/spl-token');
    const recipientAta = await getAssociatedTokenAddress(mintPubkey, toPubkey);
    const treasuryAta = await getAssociatedTokenAddress(mintPubkey, treasury.publicKey);

    const tx = new Transaction();
    // If recipient ATA does not exist, create it
    const recipientInfo = await connection.getAccountInfo(recipientAta);
    if (!recipientInfo) {
        tx.add(
            createAssociatedTokenAccountInstruction(
                treasury.publicKey,
                recipientAta,
                toPubkey,
                mintPubkey
            )
        );
    }
    // Transfer SPL tokens
    tx.add(
        createTransferInstruction(
            treasuryAta,
            recipientAta,
            treasury.publicKey,
            amount,
            [],
            TOKEN_PROGRAM_ID
        )
    );
    const sig = await connection.sendTransaction(tx, [treasury]);
    return sig;
}
