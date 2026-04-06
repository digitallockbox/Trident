import { Engine } from './engine.interface';
export interface OrchestratorOptions {
    log?: boolean;
    validate?: (payload: any) => boolean;
    beforeExecute?: (payload: any) => void;
    afterExecute?: (result: any) => void;
}
export declare function orchestrate(engine: Engine, payload: any, options?: OrchestratorOptions): Promise<any>;
//# sourceMappingURL=orchestratorWrapper.d.ts.map