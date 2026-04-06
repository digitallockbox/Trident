import { createWriteStream } from 'fs';

const logStream = process.env.NODE_ENV === 'production'
    ? createWriteStream('logs/app.log', { flags: 'a' })
    : null;

function format(level: string, ...args: any[]) {
    const msg = `[${new Date().toISOString()}] [${level}] ${args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')}`;
    return msg;
}

export const logger = {
    info: (...args: any[]) => {
        const msg = format('INFO', ...args);
        if (logStream) logStream.write(msg + '\n');
        else console.log(msg);
    },
    warn: (...args: any[]) => {
        const msg = format('WARN', ...args);
        if (logStream) logStream.write(msg + '\n');
        else console.warn(msg);
    },
    error: (...args: any[]) => {
        const msg = format('ERROR', ...args);
        if (logStream) logStream.write(msg + '\n');
        else console.error(msg);
    },
};
