// orchestratorWrapper.ts
// Shared execution pipeline for all engines

import { Engine } from './engine.interface';

export interface OrchestratorOptions {
    log?: boolean;
    validate?: (payload: any) => boolean;
    beforeExecute?: (payload: any) => void;
    afterExecute?: (result: any) => void;
}

export async function orchestrate(
    engine: Engine,
    payload: any,
    options: OrchestratorOptions = {}
) {
    if (options.beforeExecute) options.beforeExecute(payload);
    if (options.validate && !options.validate(payload)) {
        return { status: 'error', error: 'Validation failed' };
    }
    if (options.log) {
        // eslint-disable-next-line no-console
        console.log(`[Orchestrator] Executing engine with payload:`, payload);
    }
    const result = await engine.execute(payload);
    if (options.afterExecute) options.afterExecute(result);
    if (options.log) {
        // eslint-disable-next-line no-console
        console.log(`[Orchestrator] Result:`, result);
    }
    return result;
}
