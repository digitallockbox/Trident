import * as engines from '../engine';

export function getEngine(name: string) {
    return engines[name];
}

export function listEngines() {
    return Object.keys(engines);
}
