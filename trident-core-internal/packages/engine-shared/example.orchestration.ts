// Example: Orchestrating internal engines
import { runEngine } from './orchestrator';
import { OmegaEngine } from '@trident/internal-omega/src/engine';
import { AegisEngine } from '@trident/internal-aegis/src/engine';
import { OverwatchEngine } from '@trident/internal-overwatch/src/engine';

async function main() {
    const payload = { foo: 'bar' };

    const omegaResult = await runEngine(new OmegaEngine(), payload);
    console.log('Omega Result:', omegaResult);

    const aegisResult = await runEngine(new AegisEngine(), payload);
    console.log('Aegis Result:', aegisResult);

    const overwatchResult = await runEngine(new OverwatchEngine(), payload);
    console.log('Overwatch Result:', overwatchResult);
}

main().catch(console.error);
