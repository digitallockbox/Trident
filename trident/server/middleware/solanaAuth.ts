import type { Request, Response, NextFunction } from 'express';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

declare module 'express-serve-static-core' {
    interface Request {
        solanaPublicKey?: string;
    }
}

export function solanaAuth(req: Request, res: Response, next: NextFunction): void {
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

        req.solanaPublicKey = pubkey;
        next();
    } catch {
        res.status(401).end('Malformed authentication data');
    }
}
