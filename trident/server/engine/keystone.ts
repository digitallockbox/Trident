/**
 * Keystone — API Key Management Engine
 *
 * Multi-tenant API key system that turns the platform from internal
 * tooling into a commercial-grade API product. Businesses get scoped
 * API keys with rate limits, permissions, and usage tracking.
 *
 * Core flow:
 *   1. Business registers → receives a master API key
 *   2. Master key can create scoped sub-keys (read-only, payments, admin)
 *   3. Every API call validates the key → checks scope, rate limit, status
 *   4. Usage is tracked per key for billing and analytics
 *
 * Actions:
 *   createKey     — Generate a new API key with scopes
 *   revokeKey     — Revoke an active key
 *   rotateKey     — Rotate a key (revoke old, issue new with same scopes)
 *   validateKey   — Validate a key and return its scopes
 *   listKeys      — List all keys for a business
 *   usage         — Get usage stats for a key
 *   configure     — Update key management settings
 *   stats         — Platform-wide key statistics
 */
export class Keystone {
    // ── Key store ────────────────────────────────────────────
    private keys: Map<string, {
        id: string;
        hashedKey: string;        // We store hash, return raw key only on creation
        prefix: string;           // First 8 chars for identification (e.g. "trident_")
        businessId: string;
        name: string;
        scopes: string[];         // e.g. ['payments.read', 'payments.write', 'payouts.create']
        type: 'master' | 'scoped' | 'readonly';
        rateLimit: number;        // requests per minute
        status: 'active' | 'revoked' | 'expired';
        usageCount: number;
        lastUsedAt: string | null;
        createdAt: string;
        expiresAt: string | null;
        revokedAt: string | null;
        metadata: Record<string, any>;
    }> = new Map();

    // ── Usage log ────────────────────────────────────────────
    private usageLog: Array<{
        keyId: string;
        businessId: string;
        endpoint: string;
        method: string;
        statusCode: number;
        timestamp: string;
    }> = [];

    // ── Rate limit windows ───────────────────────────────────
    private rateLimitWindows: Map<string, { count: number; windowStart: number }> = new Map();

    // ── Configuration ────────────────────────────────────────
    private config = {
        defaultRateLimit: 60,           // requests per minute
        masterKeyRateLimit: 300,
        maxKeysPerBusiness: 25,
        keyExpirationDays: 365,         // 0 = no expiration
        keyPrefix: 'trident',
    };

    // ── Valid scopes ─────────────────────────────────────────
    private readonly VALID_SCOPES = [
        'payments.read',
        'payments.write',
        'payouts.create',
        'payouts.read',
        'splits.manage',
        'webhooks.manage',
        'relay.submit',
        'relay.read',
        'admin.full',
        'analytics.read',
    ];

    // ═══════════════════════════════════════════════════════════
    async execute(data: Record<string, any>): Promise<Record<string, any>> {
        const action = data.action || 'stats';

        switch (action) {
            case 'createKey': return this.createKey(data);
            case 'revokeKey': return this.revokeKey(data);
            case 'rotateKey': return this.rotateKey(data);
            case 'validateKey': return this.validateKey(data);
            case 'listKeys': return this.listKeys(data);
            case 'usage': return this.getUsage(data);
            case 'recordUsage': return this.recordUsage(data);
            case 'configure': return this.updateConfig(data);
            case 'stats': return this.getStats();
            default:
                return { status: 'error', engine: 'Keystone', error: `Unknown action: ${action}` };
        }
    }

    // ── 1. Create API key ────────────────────────────────────

    private createKey(data: Record<string, any>): Record<string, any> {
        const businessId = data.businessId as string;
        const name = data.name as string;
        const scopes = data.scopes as string[] | undefined;
        const type = (data.type as 'master' | 'scoped' | 'readonly') || 'scoped';
        const rateLimit = Number(data.rateLimit) || (type === 'master' ? this.config.masterKeyRateLimit : this.config.defaultRateLimit);
        const expirationDays = data.expirationDays !== undefined ? Number(data.expirationDays) : this.config.keyExpirationDays;
        const metadata = data.metadata || {};

        if (!businessId) return { status: 'error', engine: 'Keystone', error: 'Missing businessId' };
        if (!name) return { status: 'error', engine: 'Keystone', error: 'Missing key name' };

        // Validate scopes
        const resolvedScopes = type === 'master'
            ? [...this.VALID_SCOPES]
            : type === 'readonly'
                ? this.VALID_SCOPES.filter((s) => s.endsWith('.read'))
                : scopes || [];

        if (type === 'scoped' && resolvedScopes.length === 0) {
            return { status: 'error', engine: 'Keystone', error: 'Scoped keys require at least one scope' };
        }

        const invalidScopes = resolvedScopes.filter((s) => !this.VALID_SCOPES.includes(s));
        if (invalidScopes.length > 0) {
            return { status: 'error', engine: 'Keystone', error: `Invalid scopes: ${invalidScopes.join(', ')}` };
        }

        // Check per-business limit
        const businessKeys = Array.from(this.keys.values()).filter(
            (k) => k.businessId === businessId && k.status === 'active'
        );
        if (businessKeys.length >= this.config.maxKeysPerBusiness) {
            return { status: 'error', engine: 'Keystone', error: `Maximum ${this.config.maxKeysPerBusiness} active keys per business` };
        }

        // Generate key
        const rawKey = `${this.config.keyPrefix}_${type === 'master' ? 'mk' : type === 'readonly' ? 'ro' : 'sk'}_${this.generateToken(32)}`;
        const id = `KEY-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const hashedKey = this.hashKey(rawKey);
        const now = new Date();

        let expiresAt: string | null = null;
        if (expirationDays > 0) {
            const exp = new Date(now);
            exp.setDate(exp.getDate() + expirationDays);
            expiresAt = exp.toISOString();
        }

        this.keys.set(id, {
            id,
            hashedKey,
            prefix: rawKey.slice(0, 12),
            businessId,
            name,
            scopes: resolvedScopes,
            type,
            rateLimit,
            status: 'active',
            usageCount: 0,
            lastUsedAt: null,
            createdAt: now.toISOString(),
            expiresAt,
            revokedAt: null,
            metadata,
        });

        return {
            status: 'success',
            engine: 'Keystone',
            key: {
                id,
                rawKey,                       // Only returned on creation
                prefix: rawKey.slice(0, 12),
                businessId,
                name,
                type,
                scopes: resolvedScopes,
                rateLimit,
                expiresAt,
            },
        };
    }

    // ── 2. Revoke key ────────────────────────────────────────

    private revokeKey(data: Record<string, any>): Record<string, any> {
        const keyId = data.keyId as string;
        if (!keyId) return { status: 'error', engine: 'Keystone', error: 'Missing keyId' };

        const key = this.keys.get(keyId);
        if (!key) return { status: 'error', engine: 'Keystone', error: 'Key not found' };
        if (key.status === 'revoked') return { status: 'error', engine: 'Keystone', error: 'Key already revoked' };

        key.status = 'revoked';
        key.revokedAt = new Date().toISOString();

        return { status: 'success', engine: 'Keystone', revoked: keyId, revokedAt: key.revokedAt };
    }

    // ── 3. Rotate key ────────────────────────────────────────

    private rotateKey(data: Record<string, any>): Record<string, any> {
        const keyId = data.keyId as string;
        if (!keyId) return { status: 'error', engine: 'Keystone', error: 'Missing keyId' };

        const oldKey = this.keys.get(keyId);
        if (!oldKey) return { status: 'error', engine: 'Keystone', error: 'Key not found' };
        if (oldKey.status !== 'active') return { status: 'error', engine: 'Keystone', error: 'Can only rotate active keys' };

        // Revoke old key
        oldKey.status = 'revoked';
        oldKey.revokedAt = new Date().toISOString();

        // Create new key with same settings
        const result = this.createKey({
            businessId: oldKey.businessId,
            name: oldKey.name,
            scopes: oldKey.scopes,
            type: oldKey.type,
            rateLimit: oldKey.rateLimit,
            metadata: { ...oldKey.metadata, rotatedFrom: keyId },
        });

        return {
            status: 'success',
            engine: 'Keystone',
            rotated: true,
            revokedKeyId: keyId,
            newKey: result.key,
        };
    }

    // ── 4. Validate key ──────────────────────────────────────

    private validateKey(data: Record<string, any>): Record<string, any> {
        const rawKey = data.rawKey as string;
        const requiredScope = data.scope as string;

        if (!rawKey) return { status: 'error', engine: 'Keystone', error: 'Missing rawKey' };

        const hashed = this.hashKey(rawKey);
        const keyEntry = Array.from(this.keys.values()).find((k) => k.hashedKey === hashed);

        if (!keyEntry) return { status: 'error', engine: 'Keystone', error: 'Invalid API key', valid: false };
        if (keyEntry.status === 'revoked') return { status: 'error', engine: 'Keystone', error: 'API key revoked', valid: false };

        // Check expiration
        if (keyEntry.expiresAt && new Date(keyEntry.expiresAt) < new Date()) {
            keyEntry.status = 'expired';
            return { status: 'error', engine: 'Keystone', error: 'API key expired', valid: false };
        }

        // Check scope
        if (requiredScope && !keyEntry.scopes.includes(requiredScope) && !keyEntry.scopes.includes('admin.full')) {
            return {
                status: 'error',
                engine: 'Keystone',
                error: `Insufficient scope: requires ${requiredScope}`,
                valid: false,
            };
        }

        // Check rate limit
        const rateLimitResult = this.checkRateLimit(keyEntry.id, keyEntry.rateLimit);
        if (!rateLimitResult.allowed) {
            return {
                status: 'error',
                engine: 'Keystone',
                error: 'Rate limit exceeded',
                valid: false,
                retryAfterMs: rateLimitResult.retryAfterMs,
            };
        }

        // Record usage
        keyEntry.usageCount += 1;
        keyEntry.lastUsedAt = new Date().toISOString();

        return {
            status: 'success',
            engine: 'Keystone',
            valid: true,
            keyId: keyEntry.id,
            businessId: keyEntry.businessId,
            type: keyEntry.type,
            scopes: keyEntry.scopes,
            rateLimit: {
                limit: keyEntry.rateLimit,
                remaining: rateLimitResult.remaining,
                resetsAt: rateLimitResult.resetsAt,
            },
        };
    }

    // ── 5. List keys ─────────────────────────────────────────

    private listKeys(data: Record<string, any>): Record<string, any> {
        const businessId = data.businessId as string;
        const statusFilter = data.statusFilter as string;

        if (!businessId) return { status: 'error', engine: 'Keystone', error: 'Missing businessId' };

        let keys = Array.from(this.keys.values()).filter((k) => k.businessId === businessId);
        if (statusFilter) keys = keys.filter((k) => k.status === statusFilter);

        return {
            status: 'success',
            engine: 'Keystone',
            totalKeys: keys.length,
            keys: keys.map((k) => ({
                id: k.id,
                prefix: k.prefix,
                name: k.name,
                type: k.type,
                scopes: k.scopes,
                status: k.status,
                usageCount: k.usageCount,
                lastUsedAt: k.lastUsedAt,
                createdAt: k.createdAt,
                expiresAt: k.expiresAt,
            })),
        };
    }

    // ── 6. Usage stats ───────────────────────────────────────

    private getUsage(data: Record<string, any>): Record<string, any> {
        const keyId = data.keyId as string;
        const businessId = data.businessId as string;
        const limit = Math.min(Number(data.limit) || 100, 1000);

        let logs = this.usageLog;
        if (keyId) logs = logs.filter((l) => l.keyId === keyId);
        if (businessId) logs = logs.filter((l) => l.businessId === businessId);

        const key = keyId ? this.keys.get(keyId) : undefined;

        return {
            status: 'success',
            engine: 'Keystone',
            totalRequests: logs.length,
            keyInfo: key ? { id: key.id, name: key.name, usageCount: key.usageCount, rateLimit: key.rateLimit } : null,
            recentRequests: logs.slice(-limit).map((l) => ({
                endpoint: l.endpoint,
                method: l.method,
                statusCode: l.statusCode,
                timestamp: l.timestamp,
            })),
        };
    }

    // ── 7. Record usage (internal) ───────────────────────────

    private recordUsage(data: Record<string, any>): Record<string, any> {
        const keyId = data.keyId as string;
        const endpoint = (data.endpoint as string) || '/unknown';
        const method = (data.method as string) || 'GET';
        const statusCode = Number(data.statusCode) || 200;

        if (!keyId) return { status: 'error', engine: 'Keystone', error: 'Missing keyId' };

        const key = this.keys.get(keyId);
        if (!key) return { status: 'error', engine: 'Keystone', error: 'Key not found' };

        this.usageLog.push({
            keyId,
            businessId: key.businessId,
            endpoint,
            method,
            statusCode,
            timestamp: new Date().toISOString(),
        });

        return { status: 'success', engine: 'Keystone', recorded: true };
    }

    // ── 8. Configuration ─────────────────────────────────────

    private updateConfig(data: Record<string, any>): Record<string, any> {
        if (data.defaultRateLimit !== undefined) this.config.defaultRateLimit = Number(data.defaultRateLimit);
        if (data.masterKeyRateLimit !== undefined) this.config.masterKeyRateLimit = Number(data.masterKeyRateLimit);
        if (data.maxKeysPerBusiness !== undefined) this.config.maxKeysPerBusiness = Number(data.maxKeysPerBusiness);
        if (data.keyExpirationDays !== undefined) this.config.keyExpirationDays = Number(data.keyExpirationDays);
        if (data.keyPrefix !== undefined) this.config.keyPrefix = String(data.keyPrefix);

        return { status: 'success', engine: 'Keystone', config: { ...this.config } };
    }

    // ── 9. Stats ─────────────────────────────────────────────

    private getStats(): Record<string, any> {
        const active = Array.from(this.keys.values()).filter((k) => k.status === 'active').length;
        const revoked = Array.from(this.keys.values()).filter((k) => k.status === 'revoked').length;
        const expired = Array.from(this.keys.values()).filter((k) => k.status === 'expired').length;
        const totalUsage = Array.from(this.keys.values()).reduce((s, k) => s + k.usageCount, 0);

        const businessIds = new Set(Array.from(this.keys.values()).map((k) => k.businessId));

        return {
            status: 'success',
            engine: 'Keystone',
            totalKeys: this.keys.size,
            active,
            revoked,
            expired,
            totalUsage,
            totalBusinesses: businessIds.size,
            config: { ...this.config },
        };
    }

    // ── Helpers ──────────────────────────────────────────────

    private generateToken(length: number): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    private hashKey(rawKey: string): string {
        // Simple deterministic hash for in-memory comparison
        // In production: use crypto.createHash('sha256')
        let hash = 0;
        for (let i = 0; i < rawKey.length; i++) {
            const char = rawKey.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit int
        }
        return `hash_${Math.abs(hash).toString(36)}`;
    }

    private checkRateLimit(keyId: string, limit: number): { allowed: boolean; remaining: number; resetsAt: string; retryAfterMs?: number } {
        const now = Date.now();
        const windowMs = 60_000; // 1 minute window
        const window = this.rateLimitWindows.get(keyId);

        if (!window || now - window.windowStart >= windowMs) {
            this.rateLimitWindows.set(keyId, { count: 1, windowStart: now });
            return {
                allowed: true,
                remaining: limit - 1,
                resetsAt: new Date(now + windowMs).toISOString(),
            };
        }

        if (window.count >= limit) {
            const retryAfterMs = windowMs - (now - window.windowStart);
            return {
                allowed: false,
                remaining: 0,
                resetsAt: new Date(window.windowStart + windowMs).toISOString(),
                retryAfterMs,
            };
        }

        window.count += 1;
        return {
            allowed: true,
            remaining: limit - window.count,
            resetsAt: new Date(window.windowStart + windowMs).toISOString(),
        };
    }
}
