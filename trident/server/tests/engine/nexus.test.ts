import { describe, it, expect, beforeEach } from 'vitest';
import { Nexus } from '../../engine/nexus';

describe('Nexus Engine', () => {
    let nexus: Nexus;

    beforeEach(() => {
        nexus = new Nexus();
    });

    describe('register', () => {
        it('registers a new endpoint', async () => {
            const result = await nexus.execute({
                action: 'register',
                name: 'auth-service',
                url: 'http://localhost:4000',
            });

            expect(result.status).toBe('success');
            expect(result.endpointId).toBeDefined();
            expect(result.name).toBe('auth-service');
        });

        it('rejects registration without name', async () => {
            const result = await nexus.execute({ action: 'register', url: 'http://x' });
            expect(result.status).toBe('error');
        });

        it('rejects registration without url', async () => {
            const result = await nexus.execute({ action: 'register', name: 'svc' });
            expect(result.status).toBe('error');
        });
    });

    describe('route', () => {
        it('routes to a registered endpoint', async () => {
            await nexus.execute({ action: 'register', name: 'api', url: 'http://localhost:3000' });

            const result = await nexus.execute({
                action: 'route',
                target: 'api',
                payload: { key: 'value' },
            });

            expect(result.status).toBe('success');
            expect(result.routed.name).toBe('api');
            expect(result.payload).toEqual({ key: 'value' });
        });

        it('returns error for unknown target', async () => {
            const result = await nexus.execute({ action: 'route', target: 'nonexistent' });
            expect(result.status).toBe('error');
        });

        it('increments request count on route', async () => {
            await nexus.execute({ action: 'register', name: 'svc', url: 'http://x' });
            await nexus.execute({ action: 'route', target: 'svc' });
            await nexus.execute({ action: 'route', target: 'svc' });

            const status = await nexus.execute({ action: 'status' });
            expect(status.totalRequests).toBe(2);
        });
    });

    describe('deregister', () => {
        it('removes a registered endpoint', async () => {
            const reg = await nexus.execute({ action: 'register', name: 'svc', url: 'http://x' });
            const result = await nexus.execute({ action: 'deregister', endpointId: reg.endpointId });

            expect(result.removed).toBe(true);
        });

        it('returns false for unknown endpoint', async () => {
            const result = await nexus.execute({ action: 'deregister', endpointId: 'EP-fake' });
            expect(result.removed).toBe(false);
        });
    });

    describe('health', () => {
        it('checks health of all endpoints', async () => {
            await nexus.execute({ action: 'register', name: 'a', url: 'http://a' });
            await nexus.execute({ action: 'register', name: 'b', url: 'http://b' });

            const result = await nexus.execute({ action: 'health' });

            expect(result.status).toBe('success');
            expect(result.checked).toBe(2);
            expect(result.endpoints).toHaveLength(2);
        });
    });

    describe('status', () => {
        it('returns summary with no endpoints', async () => {
            const result = await nexus.execute({ action: 'status' });

            expect(result.totalEndpoints).toBe(0);
            expect(result.active).toBe(0);
        });
    });

    it('returns error for unknown action', async () => {
        const result = await nexus.execute({ action: 'unknown' });
        expect(result.status).toBe('error');
    });
});
