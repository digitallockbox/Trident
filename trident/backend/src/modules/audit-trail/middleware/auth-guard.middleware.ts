import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import bs58 from 'bs58';
import nacl from 'tweetnacl';

export interface AuditJwtPayload {
    wallet: string;
    role: string;
}

interface AuthGuardConfig {
    jwtSecret: string;
    allowedRoles: string[];
    walletAllowlist?: string[];
}

interface RateCounter {
    count: number;
    resetAt: number;
}

const counters = new Map<string, RateCounter>();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 200;

const parseBearer = (req: Request): string | null => {
    const header = req.headers.authorization;
    if (!header || !header.toLowerCase().startsWith('bearer ')) {
        return null;
    }
    return header.slice(7).trim();
};

const getWalletFromRequest = (req: Request): string => req.user?.wallet ?? 'anonymous';

export const verifyWalletSignature = (wallet: string, message: string, signature: string): boolean => {
    try {
        const publicKey = bs58.decode(wallet);
        const sig = bs58.decode(signature);
        const msg = new TextEncoder().encode(message);
        return nacl.sign.detached.verify(msg, sig, publicKey);
    } catch {
        return false;
    }
};

export const issueAuditJwt = (
    payload: AuditJwtPayload,
    jwtSecret: string,
    expiresIn: SignOptions['expiresIn'] = '8h',
): string =>
    jwt.sign(payload, jwtSecret, { expiresIn });

export const requireAuditAuth = (config: AuthGuardConfig) => (req: Request, res: Response, next: NextFunction) => {
    const token = parseBearer(req);

    if (!token) {
        if (req.user?.wallet && req.user?.role) {
            next();
            return;
        }
        res.status(401).json({ ok: false, error: 'Missing bearer token' });
        return;
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret) as AuditJwtPayload;
        req.user = { wallet: decoded.wallet, role: decoded.role };

        if (!config.allowedRoles.includes(decoded.role)) {
            res.status(403).json({ ok: false, error: 'Role not permitted' });
            return;
        }

        if (config.walletAllowlist?.length && !config.walletAllowlist.includes(decoded.wallet)) {
            res.status(403).json({ ok: false, error: 'Wallet not allowlisted' });
            return;
        }

        next();
    } catch {
        res.status(401).json({ ok: false, error: 'Invalid bearer token' });
    }
};

export const auditRateLimit = () => (req: Request, res: Response, next: NextFunction) => {
    const wallet = getWalletFromRequest(req);
    const now = Date.now();
    const current = counters.get(wallet);

    if (!current || current.resetAt <= now) {
        counters.set(wallet, { count: 1, resetAt: now + WINDOW_MS });
        next();
        return;
    }

    if (current.count >= MAX_REQUESTS) {
        res.status(429).json({ ok: false, error: 'Audit API rate limit exceeded' });
        return;
    }

    current.count += 1;
    next();
};
