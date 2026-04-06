import { describe, it, expect, beforeEach } from 'vitest';
import { Keystone } from '../../engine/keystone';

describe('Keystone — API Key Management Engine', () => {
    let keystone: Keystone;

    beforeEach(() => {
        keystone = new Keystone();
    });

    // ── Helpers ──────────────────────────────────────────────

    async function createMasterKey(businessId = 'BIZ-acme') {
        const result = await keystone.execute({
            action: 'createKey',
            businessId,
            name: 'Master Key',
            type: 'master',
        });
        return result;
    }

    async function createScopedKey(businessId = 'BIZ-acme', scopes = ['payments.read', 'payments.write']) {
        const result = await keystone.execute({
            action: 'createKey',
            businessId,
            name: 'Payments Key',
            type: 'scoped',
            scopes,
        });
        return result;
    }

    // ═══════════════════════════════════════════════════════════
    // 1. KEY CREATION
    // ═══════════════════════════════════════════════════════════

    describe('createKey', () => {
        it('creates a master API key with all scopes', async () => {
            const result = await createMasterKey();
            expect(result.status).toBe('success');
            expect(result.key.rawKey).toMatch(/^trident_mk_/);
            expect(result.key.type).toBe('master');
            expect(result.key.scopes.length).toBeGreaterThan(5);
            expect(result.key.scopes).toContain('admin.full');
        });

        it('creates a scoped key with specific permissions', async () => {
            const result = await createScopedKey('BIZ-store', ['payments.read', 'relay.submit']);
            expect(result.status).toBe('success');
            expect(result.key.rawKey).toMatch(/^trident_sk_/);
            expect(result.key.scopes).toEqual(['payments.read', 'relay.submit']);
        });

        it('creates a readonly key with only read scopes', async () => {
            const result = await keystone.execute({
                action: 'createKey',
                businessId: 'BIZ-x',
                name: 'Read Only',
                type: 'readonly',
            });
            expect(result.status).toBe('success');
            expect(result.key.rawKey).toMatch(/^trident_ro_/);
            expect(result.key.scopes.every((s: string) => s.endsWith('.read'))).toBe(true);
        });

        it('returns raw key only on creation', async () => {
            const created = await createMasterKey();
            expect(created.key.rawKey).toBeTruthy();

            // Listing should NOT expose raw keys
            const list = await keystone.execute({ action: 'listKeys', businessId: 'BIZ-acme' });
            const listedKey = list.keys[0];
            expect(listedKey.rawKey).toBeUndefined();
        });

        it('rejects missing businessId', async () => {
            const result = await keystone.execute({ action: 'createKey', name: 'X', type: 'master' });
            expect(result.status).toBe('error');
        });

        it('rejects missing name', async () => {
            const result = await keystone.execute({ action: 'createKey', businessId: 'BIZ-x', type: 'master' });
            expect(result.status).toBe('error');
        });

        it('rejects scoped key with no scopes', async () => {
            const result = await keystone.execute({
                action: 'createKey',
                businessId: 'BIZ-x',
                name: 'Empty',
                type: 'scoped',
                scopes: [],
            });
            expect(result.status).toBe('error');
            expect(result.error).toContain('at least one scope');
        });

        it('rejects invalid scopes', async () => {
            const result = await keystone.execute({
                action: 'createKey',
                businessId: 'BIZ-x',
                name: 'Bad',
                type: 'scoped',
                scopes: ['payments.read', 'hacking.everything'],
            });
            expect(result.status).toBe('error');
            expect(result.error).toContain('Invalid scopes');
        });

        it('enforces max keys per business', async () => {
            await keystone.execute({ action: 'configure', maxKeysPerBusiness: 2 });
            await createScopedKey('BIZ-x', ['payments.read']);
            await createScopedKey('BIZ-x', ['payments.write']);

            const result = await createScopedKey('BIZ-x', ['relay.submit']);
            expect(result.status).toBe('error');
            expect(result.error).toContain('Maximum');
        });

        it('sets expiration date', async () => {
            const result = await keystone.execute({
                action: 'createKey',
                businessId: 'BIZ-x',
                name: 'Expiring',
                type: 'scoped',
                scopes: ['payments.read'],
                expirationDays: 30,
            });
            expect(result.key.expiresAt).toBeTruthy();
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 2. KEY VALIDATION
    // ═══════════════════════════════════════════════════════════

    describe('validateKey', () => {
        it('validates an active key', async () => {
            const created = await createMasterKey();
            const result = await keystone.execute({
                action: 'validateKey',
                rawKey: created.key.rawKey,
            });

            expect(result.status).toBe('success');
            expect(result.valid).toBe(true);
            expect(result.businessId).toBe('BIZ-acme');
            expect(result.type).toBe('master');
        });

        it('validates key with required scope — passes', async () => {
            const created = await createScopedKey('BIZ-x', ['payments.read', 'payments.write']);
            const result = await keystone.execute({
                action: 'validateKey',
                rawKey: created.key.rawKey,
                scope: 'payments.read',
            });
            expect(result.valid).toBe(true);
        });

        it('validates key with required scope — fails', async () => {
            const created = await createScopedKey('BIZ-x', ['payments.read']);
            const result = await keystone.execute({
                action: 'validateKey',
                rawKey: created.key.rawKey,
                scope: 'admin.full',
            });
            expect(result.valid).toBe(false);
            expect(result.error).toContain('Insufficient scope');
        });

        it('master key passes any scope check', async () => {
            const created = await createMasterKey();
            const result = await keystone.execute({
                action: 'validateKey',
                rawKey: created.key.rawKey,
                scope: 'relay.submit',
            });
            expect(result.valid).toBe(true);
        });

        it('rejects invalid key', async () => {
            const result = await keystone.execute({ action: 'validateKey', rawKey: 'trident_sk_bogus' });
            expect(result.valid).toBe(false);
        });

        it('rejects revoked key', async () => {
            const created = await createMasterKey();
            await keystone.execute({ action: 'revokeKey', keyId: created.key.id });

            const result = await keystone.execute({ action: 'validateKey', rawKey: created.key.rawKey });
            expect(result.valid).toBe(false);
            expect(result.error).toContain('revoked');
        });

        it('tracks usage count on validation', async () => {
            const created = await createMasterKey();
            await keystone.execute({ action: 'validateKey', rawKey: created.key.rawKey });
            await keystone.execute({ action: 'validateKey', rawKey: created.key.rawKey });
            await keystone.execute({ action: 'validateKey', rawKey: created.key.rawKey });

            const list = await keystone.execute({ action: 'listKeys', businessId: 'BIZ-acme' });
            expect(list.keys[0].usageCount).toBe(3);
        });

        it('returns rate limit info', async () => {
            const created = await createMasterKey();
            const result = await keystone.execute({ action: 'validateKey', rawKey: created.key.rawKey });
            expect(result.rateLimit).toBeDefined();
            expect(result.rateLimit.limit).toBeGreaterThan(0);
            expect(result.rateLimit.remaining).toBeDefined();
        });

        it('rejects missing rawKey', async () => {
            const result = await keystone.execute({ action: 'validateKey' });
            expect(result.status).toBe('error');
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 3. KEY REVOCATION
    // ═══════════════════════════════════════════════════════════

    describe('revokeKey', () => {
        it('revokes an active key', async () => {
            const created = await createMasterKey();
            const result = await keystone.execute({ action: 'revokeKey', keyId: created.key.id });
            expect(result.status).toBe('success');
            expect(result.revoked).toBe(created.key.id);
        });

        it('rejects revoking an already-revoked key', async () => {
            const created = await createMasterKey();
            await keystone.execute({ action: 'revokeKey', keyId: created.key.id });
            const result = await keystone.execute({ action: 'revokeKey', keyId: created.key.id });
            expect(result.status).toBe('error');
            expect(result.error).toContain('already revoked');
        });

        it('rejects unknown key', async () => {
            const result = await keystone.execute({ action: 'revokeKey', keyId: 'KEY-fake' });
            expect(result.status).toBe('error');
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 4. KEY ROTATION
    // ═══════════════════════════════════════════════════════════

    describe('rotateKey', () => {
        it('rotates a key: revokes old, creates new with same scopes', async () => {
            const created = await createScopedKey('BIZ-x', ['payments.read', 'payments.write']);
            const result = await keystone.execute({ action: 'rotateKey', keyId: created.key.id });

            expect(result.status).toBe('success');
            expect(result.rotated).toBe(true);
            expect(result.revokedKeyId).toBe(created.key.id);
            expect(result.newKey.rawKey).toBeTruthy();
            expect(result.newKey.scopes).toEqual(['payments.read', 'payments.write']);

            // Old key should no longer validate
            const oldValidation = await keystone.execute({ action: 'validateKey', rawKey: created.key.rawKey });
            expect(oldValidation.valid).toBe(false);

            // New key should validate
            const newValidation = await keystone.execute({ action: 'validateKey', rawKey: result.newKey.rawKey });
            expect(newValidation.valid).toBe(true);
        });

        it('rejects rotating a revoked key', async () => {
            const created = await createMasterKey();
            await keystone.execute({ action: 'revokeKey', keyId: created.key.id });
            const result = await keystone.execute({ action: 'rotateKey', keyId: created.key.id });
            expect(result.status).toBe('error');
        });

        it('rejects unknown key', async () => {
            const result = await keystone.execute({ action: 'rotateKey', keyId: 'KEY-fake' });
            expect(result.status).toBe('error');
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 5. KEY LISTING
    // ═══════════════════════════════════════════════════════════

    describe('listKeys', () => {
        it('lists all keys for a business', async () => {
            await createMasterKey('BIZ-a');
            await createScopedKey('BIZ-a', ['payments.read']);

            const result = await keystone.execute({ action: 'listKeys', businessId: 'BIZ-a' });
            expect(result.totalKeys).toBe(2);
        });

        it('filters by status', async () => {
            const key = await createMasterKey('BIZ-a');
            await createScopedKey('BIZ-a', ['payments.read']);
            await keystone.execute({ action: 'revokeKey', keyId: key.key.id });

            const active = await keystone.execute({ action: 'listKeys', businessId: 'BIZ-a', statusFilter: 'active' });
            const revoked = await keystone.execute({ action: 'listKeys', businessId: 'BIZ-a', statusFilter: 'revoked' });

            expect(active.totalKeys).toBe(1);
            expect(revoked.totalKeys).toBe(1);
        });

        it('rejects missing businessId', async () => {
            const result = await keystone.execute({ action: 'listKeys' });
            expect(result.status).toBe('error');
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 6. USAGE TRACKING
    // ═══════════════════════════════════════════════════════════

    describe('usage', () => {
        it('records and retrieves usage', async () => {
            const created = await createMasterKey();

            await keystone.execute({
                action: 'recordUsage',
                keyId: created.key.id,
                endpoint: '/conduit/execute',
                method: 'POST',
                statusCode: 200,
            });
            await keystone.execute({
                action: 'recordUsage',
                keyId: created.key.id,
                endpoint: '/relay/execute',
                method: 'POST',
                statusCode: 200,
            });

            const result = await keystone.execute({ action: 'usage', keyId: created.key.id });
            expect(result.totalRequests).toBe(2);
            expect(result.recentRequests).toHaveLength(2);
        });

        it('filters usage by business', async () => {
            const a = await createMasterKey('BIZ-a');
            const b = await createMasterKey('BIZ-b');

            await keystone.execute({ action: 'recordUsage', keyId: a.key.id, endpoint: '/x' });
            await keystone.execute({ action: 'recordUsage', keyId: b.key.id, endpoint: '/y' });

            const result = await keystone.execute({ action: 'usage', businessId: 'BIZ-a' });
            expect(result.totalRequests).toBe(1);
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 7. CONFIGURATION
    // ═══════════════════════════════════════════════════════════

    describe('configure', () => {
        it('updates keystone config', async () => {
            const result = await keystone.execute({
                action: 'configure',
                defaultRateLimit: 120,
                keyPrefix: 'myplatform',
            });
            expect(result.config.defaultRateLimit).toBe(120);
            expect(result.config.keyPrefix).toBe('myplatform');
        });

        it('new key uses updated prefix', async () => {
            await keystone.execute({ action: 'configure', keyPrefix: 'acme' });
            const created = await createMasterKey();
            expect(created.key.rawKey).toMatch(/^acme_mk_/);
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 8. STATS
    // ═══════════════════════════════════════════════════════════

    describe('stats', () => {
        it('returns platform-wide key statistics', async () => {
            await createMasterKey('BIZ-a');
            await createScopedKey('BIZ-b', ['payments.read']);
            const toRevoke = await createScopedKey('BIZ-b', ['relay.submit']);
            await keystone.execute({ action: 'revokeKey', keyId: toRevoke.key.id });

            const result = await keystone.execute({ action: 'stats' });
            expect(result.totalKeys).toBe(3);
            expect(result.active).toBe(2);
            expect(result.revoked).toBe(1);
            expect(result.totalBusinesses).toBe(2);
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 9. FULL LIFECYCLE — MULTI-TENANT API ACCESS
    // ═══════════════════════════════════════════════════════════

    describe('full lifecycle — multi-tenant API access', () => {
        it('end-to-end: onboard business, issue keys, validate, rotate, revoke', async () => {
            // 1. Retail store gets a master key
            const master = await keystone.execute({
                action: 'createKey',
                businessId: 'BIZ-downtown-store',
                name: 'Store Master',
                type: 'master',
            });
            expect(master.status).toBe('success');
            const masterRawKey = master.key.rawKey;

            // 2. Store creates a scoped key for their POS system
            const posKey = await keystone.execute({
                action: 'createKey',
                businessId: 'BIZ-downtown-store',
                name: 'POS Terminal',
                type: 'scoped',
                scopes: ['payments.write', 'relay.submit'],
            });
            expect(posKey.status).toBe('success');

            // 3. Store creates a readonly key for their dashboard
            const dashKey = await keystone.execute({
                action: 'createKey',
                businessId: 'BIZ-downtown-store',
                name: 'Dashboard',
                type: 'readonly',
            });
            expect(dashKey.status).toBe('success');

            // 4. POS key can submit payments
            const posValidation = await keystone.execute({
                action: 'validateKey',
                rawKey: posKey.key.rawKey,
                scope: 'payments.write',
            });
            expect(posValidation.valid).toBe(true);

            // 5. Dashboard key cannot submit payments
            const dashValidation = await keystone.execute({
                action: 'validateKey',
                rawKey: dashKey.key.rawKey,
                scope: 'payments.write',
            });
            expect(dashValidation.valid).toBe(false);

            // 6. Dashboard key CAN read analytics
            const dashRead = await keystone.execute({
                action: 'validateKey',
                rawKey: dashKey.key.rawKey,
                scope: 'analytics.read',
            });
            expect(dashRead.valid).toBe(true);

            // 7. Record some usage
            await keystone.execute({ action: 'recordUsage', keyId: posKey.key.id, endpoint: '/relay/execute', method: 'POST', statusCode: 200 });
            await keystone.execute({ action: 'recordUsage', keyId: posKey.key.id, endpoint: '/conduit/execute', method: 'POST', statusCode: 200 });
            await keystone.execute({ action: 'recordUsage', keyId: dashKey.key.id, endpoint: '/conduit/execute', method: 'GET', statusCode: 200 });

            // 8. Rotate the POS key (security best practice)
            const rotated = await keystone.execute({ action: 'rotateKey', keyId: posKey.key.id });
            expect(rotated.rotated).toBe(true);

            // Old POS key no longer works
            const oldCheck = await keystone.execute({ action: 'validateKey', rawKey: posKey.key.rawKey });
            expect(oldCheck.valid).toBe(false);

            // New POS key works
            const newCheck = await keystone.execute({ action: 'validateKey', rawKey: rotated.newKey.rawKey, scope: 'payments.write' });
            expect(newCheck.valid).toBe(true);

            // 9. List all keys
            const list = await keystone.execute({ action: 'listKeys', businessId: 'BIZ-downtown-store' });
            expect(list.totalKeys).toBe(4); // master + old POS (revoked) + dashboard + new POS

            // 10. Platform stats
            const stats = await keystone.execute({ action: 'stats' });
            expect(stats.totalKeys).toBe(4);
            expect(stats.active).toBe(3);
            expect(stats.revoked).toBe(1);
            expect(stats.totalBusinesses).toBe(1);
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 10. EDGE CASES
    // ═══════════════════════════════════════════════════════════

    describe('edge cases', () => {
        it('returns error for unknown action', async () => {
            const result = await keystone.execute({ action: 'destroyAll' });
            expect(result.status).toBe('error');
            expect(result.error).toContain('Unknown action');
        });

        it('no-expiration key has null expiresAt', async () => {
            const result = await keystone.execute({
                action: 'createKey',
                businessId: 'BIZ-x',
                name: 'Forever',
                type: 'scoped',
                scopes: ['payments.read'],
                expirationDays: 0,
            });
            expect(result.key.expiresAt).toBeNull();
        });
    });
});
