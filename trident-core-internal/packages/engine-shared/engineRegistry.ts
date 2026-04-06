// engineRegistry.ts
// Central registry for all internal engines

import { OmegaEngine } from '@trident/internal-omega';
import { AegisEngine } from '@trident/internal-aegis';
import { OverwatchEngine } from '@trident/internal-overwatch';
import { Engine } from './engine.interface';

export type EngineName = 'omega' | 'aegis' | 'overwatch';

export interface EngineRegistryEntry {
    name: EngineName;
    description: string;
    create: () => Engine;
    version: string;
    internalPackage: string;
}

export const engineRegistry: Record<EngineName, EngineRegistryEntry> = {
    omega: {
        name: 'omega',
        description: 'Omega Engine — internal sovereign logic module.',
        version: '1.0.0',
        internalPackage: '@trident/internal-omega',
        create: () => new OmegaEngine(),
    },
    aegis: {
        name: 'aegis',
        description: 'Aegis Engine — internal verification/analysis module.',
        version: '1.0.0',
        internalPackage: '@trident/internal-aegis',
        create: () => new AegisEngine(),
    },
    overwatch: {
        name: 'overwatch',
        description: 'Overwatch Engine — internal monitoring/inspection module.',
        version: '1.0.0',
        internalPackage: '@trident/internal-overwatch',
        create: () => new OverwatchEngine(),
    },
};

// Usage:
// const engine = engineRegistry['omega'].create();
// const result = await engine.execute(payload);
