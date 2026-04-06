import { createWriteStream } from 'fs';
import path from 'path';

const logPath = path.join(__dirname, '../../logs/system.log');
export const logStream = createWriteStream(logPath, { flags: 'a' });
