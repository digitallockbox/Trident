import { Request, Response, NextFunction } from 'express';
import { paragonExecuteSchema, ParagonExecuteInput } from '../src/validation/paragon.schema';
import { verifySolanaSignature } from '../utils/solana';

// Optionally, import your API key validation util here
// import { validateApiKey } from '../utils/apiKey';

// In-memory nonce store for demo; replace with Redis or DB in production
const usedNonces = new Set<string>();
const REPLAY_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export interface HybridAuthRequest extends Request {
    hybridAuthMessage?: ParagonExecuteInput;
}

export async function hybridAuthPipeline(
    req: HybridAuthRequest,
    res: Response,
    next: NextFunction
) {
    try {
        // 1. Validate input shape and types
        const parsed = paragonExecuteSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ ok: false, error: parsed.error.flatten() });
        }
        const { nonce, timestamp, signature, publicKey, ...rest } = parsed.data;

        // 2. Replay protection: check timestamp and nonce
        const now = Date.now();
        if (Math.abs(now - timestamp) > REPLAY_WINDOW_MS) {
            return res.status(400).json({ ok: false, error: 'Request timestamp out of window' });
        }
        if (usedNonces.has(nonce)) {
            return res.status(400).json({ ok: false, error: 'Replay detected: nonce already used' });
        }
        usedNonces.add(nonce);
        setTimeout(() => usedNonces.delete(nonce), REPLAY_WINDOW_MS);

        // 3. Solana signature verification
        const message = JSON.stringify({ ...rest, nonce, timestamp });
        const valid = await verifySolanaSignature(message, signature, publicKey);
        if (!valid) {
            return res.status(401).json({ ok: false, error: 'Invalid Solana signature' });
        }

        // 4. (Optional) API key validation
        // const apiKey = req.headers['x-api-key'];
        // if (!validateApiKey(apiKey)) {
        //   return res.status(401).json({ ok: false, error: 'Invalid API key' });
        // }

        req.hybridAuthMessage = parsed.data;
        next();
    } catch (err: any) {
        const message = err?.message || err?.toString() || 'Internal error in hybrid auth pipeline';
        return res.status(500).json({ ok: false, error: message });
    }
}
