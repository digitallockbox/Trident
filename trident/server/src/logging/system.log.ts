import { logStream } from './transport';

export function logSystem(message: string) {
    const entry = `[${new Date().toISOString()}] ${message}\n`;
    logStream.write(entry);
}
