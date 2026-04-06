export const env = {
  PORT: Number(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
  API_KEY: process.env.API_KEY || '',
  TRIDENT_JWT_SECRET: process.env.TRIDENT_JWT_SECRET || process.env.JWT_SECRET || '',
  TRIDENT_AUDIT_RETENTION_DAYS: Number(process.env.TRIDENT_AUDIT_RETENTION_DAYS) || 365,
};
