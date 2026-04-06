// overwatch.entry.ts
// Entrypoint for Overwatch engine — routes to internal or dev logic based on environment

import { isInternalEnv } from '../config/env';
import { OverwatchEngine } from '@trident/internal-overwatch/src/engine';
import { executeOverwatchDev } from './overwatch.dev';

export async function executeOverwatchEntry(payload: any) {
    if (isInternalEnv()) {
        const engine = new OverwatchEngine();
        return engine.execute(payload);
    } else {
        return executeOverwatchDev(payload);
    }
}
