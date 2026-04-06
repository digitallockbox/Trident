"use strict";
// engineRegistry.ts
// Central registry for all internal engines
Object.defineProperty(exports, "__esModule", { value: true });
exports.engineRegistry = void 0;
const engine_1 = require("@trident/internal-omega/src/engine");
const engine_2 = require("@trident/internal-aegis/src/engine");
const engine_3 = require("@trident/internal-overwatch/src/engine");
exports.engineRegistry = {
    omega: {
        name: 'omega',
        description: 'Omega Engine — internal sovereign logic module.',
        version: '1.0.0',
        internalPackage: '@trident/internal-omega',
        create: () => new engine_1.OmegaEngine(),
    },
    aegis: {
        name: 'aegis',
        description: 'Aegis Engine — internal verification/analysis module.',
        version: '1.0.0',
        internalPackage: '@trident/internal-aegis',
        create: () => new engine_2.AegisEngine(),
    },
    overwatch: {
        name: 'overwatch',
        description: 'Overwatch Engine — internal monitoring/inspection module.',
        version: '1.0.0',
        internalPackage: '@trident/internal-overwatch',
        create: () => new engine_3.OverwatchEngine(),
    },
};
// Usage:
// const engine = engineRegistry['omega'].create();
// const result = await engine.execute(payload);
