import type { Request, Response, NextFunction } from 'express';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

export interface HybridTenant {
    key: string;
    tenant: string;
    active: boolean;
}

export interface HybridSovereignAuthConfig {
    tenants: HybridTenant[];
    maxSkewMs?: number; // default 5 min
    replayStore?: Set<string>; // for nonce replay protection (use Redis in prod)
}

const DEFAULT_MAX_SKEW = 5 * 60 * 1000;

export function createHybridSovereignAuth(config: HybridSovereignAuthConfig) {
    const apiKeyMap = new Map<string, HybridTenant>();
    for (const t of config.tenants) apiKeyMap.set(t.key, t);
    const replayStore = config.replayStore || new Set<string>();
    const maxSkew = config.maxSkewMs ?? DEFAULT_MAX_SKEW;

    return function hybridSovereignAuth(req: Request, res: Response, next: NextFunction): void {
        const apiKey = req.headers['x-api-key'] as string | undefined;
        const pubkey = req.headers['x-solana-publickey'] as string | undefined;
        const signature = req.headers['x-solana-signature'] as string | undefined;
        const message = req.headers['x-solana-message'] as string | undefined;

        if (!apiKey || !pubkey || !signature || !message) {
            res.status(401).end('Missing authentication headers');
            return;
        }

        const tenant = apiKeyMap.get(apiKey);
        if (!tenant || !tenant.active) {
            res.status(403).end('Invalid or inactive API key');
            return;
        }

        let parsed: any;
        try {
            const publicKeyBytes = bs58.decode(pubkey);
            const signatureBytes = bs58.decode(signature);
            const messageBytes = new TextEncoder().encode(message);
            const valid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
            if (!valid) {
                res.status(401).end('Invalid signature');
                return;
            }
            parsed = JSON.parse(message);
        } catch {
            res.status(401).end('Malformed authentication data');
            return;
        }

        // Check nonce/timestamp
        const { nonce, timestamp, action, payload } = parsed || {};
        if (!nonce || !timestamp || !action) {
            res.status(401).end('Missing nonce, timestamp, or action');
            return;
        }
        const now = Date.now();
        if (Math.abs(now - timestamp) > maxSkew) {
            res.status(401).end('Message expired');
            return;
        }
        const replayKey = `${tenant.tenant}:${pubkey}:${nonce}`;
        if (replayStore.has(replayKey)) {
            res.status(401).end('Replay detected');
            return;
        }
        replayStore.add(replayKey);
        setTimeout(() => replayStore.delete(replayKey), maxSkew);

        (req as any).tenant = tenant.tenant;
        (req as any).apiKey = apiKey;
        (req as any).solanaPublicKey = pubkey;
        (req as any).action = action;
        (req as any).payload = payload;
        next();
    };
}
