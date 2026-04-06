// aegis.entry.ts
// Entrypoint for Aegis engine — routes to internal or dev logic based on environment

import { isInternalEnv } from '../config/env';
import { AegisEngine } from '@trident/internal-aegis/src/engine';
import { executeAegisDev } from './aegis.dev';

export async function executeAegisEntry(payload: any) {
    if (isInternalEnv()) {
        const engine = new AegisEngine();
        return engine.execute(payload);
    } else {
        return executeAegisDev(payload);
    }
}
