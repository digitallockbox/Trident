import winston from 'winston';
import { env } from '../core/config/env';

const isDev = env.nodeEnv !== 'production';

export const logger = winston.createLogger({
    level: isDev ? 'debug' : 'info',
    format: isDev
        ? winston.format.combine(winston.format.colorize(), winston.format.simple())
        : winston.format.json(),
    defaultMeta: { service: 'trident-backend' },
    transports: [new winston.transports.Console()],
});
