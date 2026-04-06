// Orchestration utility for running engines
import { Engine } from './engine.interface';

export async function runEngine(engine: Engine, payload: any) {
    // Add orchestration logic, logging, error handling, etc. here
    return engine.execute(payload);
}
