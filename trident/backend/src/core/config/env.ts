import dotenv from 'dotenv';

dotenv.config();

const parsePort = (value: string | undefined, fallback: number): number => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const env = {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: parsePort(process.env.PORT, 3000),
    host: process.env.HOST ?? '0.0.0.0',
    corsOrigin: process.env.CORS_ORIGIN ?? '*',
    databaseUrl: process.env.DATABASE_URL ?? '',
    solanaRpcPrimary: process.env.SOLANA_RPC_PRIMARY ?? '',
    solanaRpcFallback: process.env.SOLANA_RPC_FALLBACK ?? '',
    treasuryPrivateKey: process.env.TREASURY_PRIVATE_KEY ?? '',
};

export const isProduction = env.nodeEnv === 'production';

