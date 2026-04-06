"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Example: Orchestrating internal engines
const orchestrator_1 = require("./orchestrator");
const engine_1 = require("@trident/internal-omega/src/engine");
const engine_2 = require("@trident/internal-aegis/src/engine");
const engine_3 = require("@trident/internal-overwatch/src/engine");
async function main() {
    const payload = { foo: 'bar' };
    const omegaResult = await (0, orchestrator_1.runEngine)(new engine_1.OmegaEngine(), payload);
    console.log('Omega Result:', omegaResult);
    const aegisResult = await (0, orchestrator_1.runEngine)(new engine_2.AegisEngine(), payload);
    console.log('Aegis Result:', aegisResult);
    const overwatchResult = await (0, orchestrator_1.runEngine)(new engine_3.OverwatchEngine(), payload);
    console.log('Overwatch Result:', overwatchResult);
}
main().catch(console.error);
