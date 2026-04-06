import { logStream } from './transport';

export function logSnapshot(snapshot: object) {
    const entry = `[${new Date().toISOString()}] SNAPSHOT: ${JSON.stringify(snapshot)}\n`;
    logStream.write(entry);
}
