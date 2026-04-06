import { Request, Response, NextFunction } from 'express';

export interface SessionUser {
  wallet: string;
  role: string;
}

const DEV_DEFAULT_WALLET = process.env.TRIDENT_DEV_WALLET || 'dev-operator-wallet';
const DEV_DEFAULT_ROLE = process.env.TRIDENT_DEV_ROLE || 'founder';

const parseHeader = (value: string | string[] | undefined): string | null => {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] || null;
  return value;
};

export const requireSession = (req: Request, res: Response, next: NextFunction) => {
  const walletHeader = parseHeader(req.headers['x-wallet']);
  const roleHeader = parseHeader(req.headers['x-role']);
  const isProd = process.env.NODE_ENV === 'production';

  if (walletHeader && roleHeader) {
    req.user = { wallet: walletHeader, role: roleHeader };
    next();
    return;
  }

  // Remove dev-only fallback in production for bulletproofing
  if (!isProd) {
    return res.status(401).json({ ok: false, error: 'Session required (dev fallback removed)' });
  }

  res.status(401).json({ ok: false, error: 'Session required' });
};

export const auth = requireSession;
