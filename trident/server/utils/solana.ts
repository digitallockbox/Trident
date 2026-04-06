import nacl from 'tweetnacl';
import { decodeUTF8 } from 'tweetnacl-util';
import bs58 from 'bs58';

/**
 * Verifies a Solana signature for a given message and public key.
 * @param message The message string (must match what was signed)
 * @param signature The base58-encoded signature
 * @param publicKey The base58-encoded public key
 * @returns true if valid, false otherwise
 */
export async function verifySolanaSignature(
    message: string,
    signature: string,
    publicKey: string
): Promise<boolean> {
    try {
        const msgUint8 = decodeUTF8(message);
        const sigUint8 = bs58.decode(signature);
        const pubKeyUint8 = bs58.decode(publicKey);
        return nacl.sign.detached.verify(msgUint8, sigUint8, pubKeyUint8);
    } catch {
        return false;
    }
}
