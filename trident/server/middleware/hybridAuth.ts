import type { Request, Response, NextFunction } from 'express';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

export interface ApiKeyRecord {
    key: string;
    tenant: string;
    active: boolean;
}

export interface HybridAuthConfig {
    apiKeys: ApiKeyRecord[];
    maxAgeMs?: number;
    usedNonces?: Set<string>; // swap for Redis later
}

export function createHybridAuth(config: HybridAuthConfig) {
    const apiKeyMap = new Map(config.apiKeys.map(r => [r.key, r]));
    const usedNonces = config.usedNonces ?? new Set<string>();
    const maxAge = config.maxAgeMs ?? 5 * 60 * 1000;

    return function hybridAuth(req: Request, res: Response, next: NextFunction): void {
        const apiKey = req.headers['x-api-key'] as string | undefined;
        const publicKey = req.headers['x-solana-publickey'] as string | undefined;
        const signature = req.headers['x-solana-signature'] as string | undefined;
        const message = req.headers['x-solana-message'] as string | undefined;
        const timestamp = req.headers['x-solana-timestamp'] as string | undefined;
        const nonce = req.headers['x-solana-nonce'] as string | undefined;

        // Required headers
        if (!apiKey || !publicKey || !signature || !message || !timestamp) {
            res.status(401).end('Missing authentication headers');
            return;
        }

        const record = apiKeyMap.get(apiKey);
        if (!record || !record.active) {
            res.status(403).end('Invalid or inactive API key');
            return;
        }

        // Timestamp validation (seconds)
        const now = Math.floor(Date.now() / 1000);
        const ts = Number(timestamp);
        if (!Number.isFinite(ts) || Math.abs(now - ts) > Math.floor(maxAge / 1000)) {
            res.status(401).end('Stale or invalid timestamp');
            return;
        }

        // Nonce replay protection
        if (nonce) {
            const key = `${publicKey}:${nonce}`;
            if (usedNonces.has(key)) {
                res.status(401).end('Nonce already used');
                return;
            }
            usedNonces.add(key);
            setTimeout(() => {
                usedNonces.delete(key);
            }, Math.floor(maxAge));
        }

        try {
            const pubKeyBytes = bs58.decode(publicKey);
            const sigBytes = bs58.decode(signature);
            const msgBytes = new TextEncoder().encode(message);
            const valid = nacl.sign.detached.verify(msgBytes, sigBytes, pubKeyBytes);
            if (!valid) {
                res.status(401).end('Invalid Solana signature');
                return;
            }
            // Parse message for action/payload
            let parsed: any = {};
            try {
                parsed = JSON.parse(message);
            } catch {
                res.status(401).end('Malformed authentication data');
                return;
            }
            (req as any).tenant = record.tenant;
            (req as any).apiKey = apiKey;
            (req as any).solanaPublicKey = publicKey;
            (req as any).action = parsed.action;
            (req as any).payload = parsed.payload;
            next();
        } catch {
            res.status(401).end('Solana signature verification failed');
        }
    };
}
