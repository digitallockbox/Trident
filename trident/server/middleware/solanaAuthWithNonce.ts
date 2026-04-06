import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { IncomingMessage, ServerResponse } from 'http';

type Handler = (req: IncomingMessage & { [key: string]: any }, res: ServerResponse, next: () => void) => void;

// Solana signature verification middleware with nonce/timestamp protection
// Expects headers:
//   x-solana-publickey: base58-encoded public key
//   x-solana-signature: base58-encoded signature
//   x-solana-message: utf8-encoded message (should match request body or canonical string)
//   x-solana-timestamp: unix timestamp (seconds)
//   x-solana-nonce: random string (optional, for replay protection)

const MAX_CLOCK_SKEW = 60; // seconds
const usedNonces = new Set<string>(); // In-memory for demo; use Redis/DB in production

export const solanaAuthWithNonce: Handler = (req, res, next) => {
    const publicKey = req.headers['x-solana-publickey'];
    const signature = req.headers['x-solana-signature'];
    const message = req.headers['x-solana-message'];
    const timestamp = req.headers['x-solana-timestamp'];
    const nonce = req.headers['x-solana-nonce'];

    if (!publicKey || !signature || !message || !timestamp) {
        res.statusCode = 401;
        return res.end('Missing Solana auth headers');
    }

    // Check timestamp freshness
    const now = Math.floor(Date.now() / 1000);
    const ts = parseInt(timestamp as string, 10);
    if (isNaN(ts) || Math.abs(now - ts) > MAX_CLOCK_SKEW) {
        res.statusCode = 401;
        return res.end('Stale or invalid timestamp');
    }

    // Check nonce replay (optional)
    if (nonce) {
        const key = `${publicKey}:${nonce}`;
        if (usedNonces.has(key)) {
            res.statusCode = 401;
            return res.end('Nonce already used');
        }
        usedNonces.add(key);
        // Optionally, clean up old nonces periodically
        setTimeout(() => usedNonces.delete(key), MAX_CLOCK_SKEW * 1000);
    }

    try {
        const pubKeyBytes = bs58.decode(publicKey as string);
        const sigBytes = bs58.decode(signature as string);
        const msgBytes = Buffer.from(message as string, 'utf8');
        const valid = nacl.sign.detached.verify(msgBytes, sigBytes, pubKeyBytes);
        if (!valid) {
            res.statusCode = 401;
            return res.end('Invalid Solana signature');
        }
        req.solanaPublicKey = publicKey;
        next();
    } catch (e) {
        res.statusCode = 401;
        return res.end('Solana signature verification failed');
    }
};
