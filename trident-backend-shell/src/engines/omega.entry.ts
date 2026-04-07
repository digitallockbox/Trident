// omega.entry.ts
// Entrypoint for Omega engine — routes to internal or dev logic based on environment

import { isInternalEnv } from '../config/env';
import { OmegaEngine } from '@trident/internal-omega';
import { executeOmegaDev } from './omega.dev';

export async function executeOmegaEntry(payload: any) {
    if (isInternalEnv()) {
        const engine = new OmegaEngine();
        return engine.execute(payload);
    }

    // Contractor‑safe dev logic
    return executeOmegaDev(payload);
}
