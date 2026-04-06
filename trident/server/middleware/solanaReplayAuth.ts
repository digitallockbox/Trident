import type { Request, Response, NextFunction } from 'express';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

const usedNonces = new Set<string>(); // replace with Redis in production
const MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes

interface SignedPayload {
    nonce: string;
    timestamp: number;
    payload: unknown;
}

export function solanaReplayProtectedAuth(req: Request, res: Response, next: NextFunction): void {
    const pubkey = req.headers['x-solana-publickey'] as string | undefined;
    const signature = req.headers['x-solana-signature'] as string | undefined;
    const message = req.headers['x-solana-message'] as string | undefined;

    if (!pubkey || !signature || !message) {
        res.status(401).end('Missing authentication headers');
        return;
    }

    try {
        const publicKeyBytes = bs58.decode(pubkey);
        const signatureBytes = bs58.decode(signature);
        const messageBytes = new TextEncoder().encode(message);

        const valid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
        if (!valid) {
            res.status(401).end('Invalid signature');
            return;
        }

        const parsed: SignedPayload = JSON.parse(message);

        const now = Date.now();
        if (Math.abs(now - parsed.timestamp) > MAX_AGE_MS) {
            res.status(401).end('Message expired');
            return;
        }

        if (usedNonces.has(parsed.nonce)) {
            res.status(401).end('Replay detected');
            return;
        }

        usedNonces.add(parsed.nonce);

        (req as any).solanaPublicKey = pubkey;
        (req as any).signedPayload = parsed.payload;
        next();
    } catch {
        res.status(401).end('Malformed authentication data');
    }
}
