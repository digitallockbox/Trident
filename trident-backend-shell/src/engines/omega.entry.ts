// omega.entry.ts
// Entrypoint for Omega engine — routes to internal or dev logic based on environment

import { isInternalEnv } from '../config/env';
import { OmegaEngine } from '@trident/internal-omega/src/engine';
import { executeOmegaDev } from './omega.dev';

export async function executeOmegaEntry(payload: any) {
    if (isInternalEnv()) {
        // Use orchestrator or direct engine instantiation as needed
        const engine = new OmegaEngine();
        return engine.execute(payload);
    } else {
        // Use contractor-safe dev logic
        return executeOmegaDev(payload);
    }
}
