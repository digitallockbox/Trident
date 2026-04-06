import { Engine } from '@trident/engine-shared/engine.interface';
export interface OmegaPayload {
    numbers: number[];
    operation: 'sum' | 'product';
}
export declare class OmegaEngine implements Engine {
    execute(payload: OmegaPayload): Promise<any>;
}
export declare const executeOmega: (payload: OmegaPayload) => Promise<any>;
//# sourceMappingURL=engine.d.ts.map