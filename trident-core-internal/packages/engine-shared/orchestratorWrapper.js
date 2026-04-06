"use strict";
// orchestratorWrapper.ts
// Shared execution pipeline for all engines
Object.defineProperty(exports, "__esModule", { value: true });
exports.orchestrate = orchestrate;
async function orchestrate(engine, payload, options = {}) {
    if (options.beforeExecute)
        options.beforeExecute(payload);
    if (options.validate && !options.validate(payload)) {
        return { status: 'error', error: 'Validation failed' };
    }
    if (options.log) {
        // eslint-disable-next-line no-console
        console.log(`[Orchestrator] Executing engine with payload:`, payload);
    }
    const result = await engine.execute(payload);
    if (options.afterExecute)
        options.afterExecute(result);
    if (options.log) {
        // eslint-disable-next-line no-console
        console.log(`[Orchestrator] Result:`, result);
    }
    return result;
}
