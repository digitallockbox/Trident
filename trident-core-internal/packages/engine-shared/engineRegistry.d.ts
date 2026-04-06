import { Engine } from './engine.interface';
export type EngineName = 'omega' | 'aegis' | 'overwatch';
export interface EngineRegistryEntry {
    name: EngineName;
    description: string;
    create: () => Engine;
    version: string;
    internalPackage: string;
}
export declare const engineRegistry: Record<EngineName, EngineRegistryEntry>;
//# sourceMappingURL=engineRegistry.d.ts.map