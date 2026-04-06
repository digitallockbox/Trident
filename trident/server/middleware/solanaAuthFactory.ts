import type { Request, Response, NextFunction } from 'express';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

export interface TenantConfig {
    name: string;
    allowedPublicKeys?: string[]; // base58
    requirePrefix?: string;       // e.g. "tenant:<name>:"
}

export function createSolanaAuth(config: TenantConfig) {
    return function solanaAuthTenant(req: Request, res: Response, next: NextFunction): void {
        const pubkey = req.headers['x-solana-publickey'] as string | undefined;
        const signature = req.headers['x-solana-signature'] as string | undefined;
        const message = req.headers['x-solana-message'] as string | undefined;

        if (!pubkey || !signature || !message) {
            res.status(401).end('Missing authentication headers');
            return;
        }

        if (config.allowedPublicKeys && !config.allowedPublicKeys.includes(pubkey)) {
            res.status(403).end('Public key not allowed for this tenant');
            return;
        }

        if (config.requirePrefix && !message.startsWith(config.requirePrefix)) {
            res.status(401).end('Invalid message prefix');
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

            (req as any).solanaPublicKey = pubkey;
            (req as any).tenant = config.name;
            next();
        } catch {
            res.status(401).end('Malformed authentication data');
        }
    };
}
