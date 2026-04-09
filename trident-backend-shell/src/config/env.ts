// env.ts
// Simple environment check for internal vs. dev

export function isInternalEnv(): boolean {
    return process.env.TRIDENT_INTERNAL === 'true';
}
