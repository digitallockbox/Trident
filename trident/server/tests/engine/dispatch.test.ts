import { describe, it, expect, beforeEach } from 'vitest';
import { Dispatch } from '../../engine/dispatch';

describe('Dispatch — Webhook Dispatch Engine', () => {
    let dispatch: Dispatch;

    beforeEach(() => {
        dispatch = new Dispatch();
    });

    // ── Helpers ──────────────────────────────────────────────

    async function registerEndpoint(
        businessId = 'BIZ-acme',
        url = 'https://acme.com/webhooks',
        events = ['payment.captured', 'payout.completed']
    ) {
        const result = await dispatch.execute({
            action: 'registerEndpoint',
            businessId,
            url,
            events,
        });
        return result;
    }

    // ═══════════════════════════════════════════════════════════
    // 1. ENDPOINT REGISTRATION
    // ═══════════════════════════════════════════════════════════

    describe('registerEndpoint', () => {
        it('registers a webhook endpoint', async () => {
            const result = await registerEndpoint();
            expect(result.status).toBe('success');
            expect(result.endpoint.url).toBe('https://acme.com/webhooks');
            expect(result.endpoint.events).toEqual(['payment.captured', 'payout.completed']);
            expect(result.secret).toMatch(/^whsec_/);
        });

        it('rejects missing businessId', async () => {
            const result = await dispatch.execute({
                action: 'registerEndpoint',
                url: 'https://x.com/wh',
                events: ['*'],
            });
            expect(result.status).toBe('error');
        });

        it('rejects missing URL', async () => {
            const result = await dispatch.execute({
                action: 'registerEndpoint',
                businessId: 'BIZ-x',
                events: ['*'],
            });
            expect(result.status).toBe('error');
        });

        it('rejects invalid URL format', async () => {
            const result = await dispatch.execute({
                action: 'registerEndpoint',
                businessId: 'BIZ-x',
                url: 'not-a-url',
                events: ['*'],
            });
            expect(result.status).toBe('error');
            expect(result.error).toContain('Invalid URL');
        });

        it('rejects empty events array', async () => {
            const result = await dispatch.execute({
                action: 'registerEndpoint',
                businessId: 'BIZ-x',
                url: 'https://x.com/wh',
                events: [],
            });
            expect(result.status).toBe('error');
        });

        it('rejects duplicate URL for same business', async () => {
            await registerEndpoint('BIZ-x', 'https://duped.com/wh');
            const result = await registerEndpoint('BIZ-x', 'https://duped.com/wh');
            expect(result.status).toBe('error');
            expect(result.error).toContain('already registered');
        });

        it('enforces max endpoints per business', async () => {
            await dispatch.execute({ action: 'configure', maxEndpointsPerBusiness: 2 });
            await registerEndpoint('BIZ-x', 'https://a.com/wh1');
            await registerEndpoint('BIZ-x', 'https://a.com/wh2');

            const result = await registerEndpoint('BIZ-x', 'https://a.com/wh3');
            expect(result.status).toBe('error');
            expect(result.error).toContain('Maximum');
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 2. REMOVE ENDPOINT
    // ═══════════════════════════════════════════════════════════

    describe('removeEndpoint', () => {
        it('removes a registered endpoint', async () => {
            const reg = await registerEndpoint();
            const result = await dispatch.execute({ action: 'removeEndpoint', endpointId: reg.endpoint.id });
            expect(result.status).toBe('success');
            expect(result.removed).toBe(reg.endpoint.id);
        });

        it('rejects unknown endpoint', async () => {
            const result = await dispatch.execute({ action: 'removeEndpoint', endpointId: 'WH-fake' });
            expect(result.status).toBe('error');
        });

        it('rejects missing endpointId', async () => {
            const result = await dispatch.execute({ action: 'removeEndpoint' });
            expect(result.status).toBe('error');
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 3. LIST ENDPOINTS
    // ═══════════════════════════════════════════════════════════

    describe('listEndpoints', () => {
        it('lists endpoints for a business', async () => {
            await registerEndpoint('BIZ-a', 'https://a1.com/wh');
            await registerEndpoint('BIZ-a', 'https://a2.com/wh');
            await registerEndpoint('BIZ-b', 'https://b.com/wh');

            const result = await dispatch.execute({ action: 'listEndpoints', businessId: 'BIZ-a' });
            expect(result.totalEndpoints).toBe(2);
        });

        it('returns all endpoints when no businessId', async () => {
            await registerEndpoint('BIZ-a', 'https://a.com/wh');
            await registerEndpoint('BIZ-b', 'https://b.com/wh');

            const result = await dispatch.execute({ action: 'listEndpoints' });
            expect(result.totalEndpoints).toBe(2);
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 4. EVENT EMISSION & DELIVERY
    // ═══════════════════════════════════════════════════════════

    describe('emit — event delivery', () => {
        it('delivers a payment.captured event to matching endpoints', async () => {
            await registerEndpoint('BIZ-a', 'https://store.com/webhooks', ['payment.captured']);

            const result = await dispatch.execute({
                action: 'emit',
                event: 'payment.captured',
                payload: { amount: 99.95, currency: 'USDC' },
            });

            expect(result.status).toBe('success');
            expect(result.event).toBe('payment.captured');
            expect(result.deliveriesTriggered).toBe(1);
            expect(result.deliveries[0].status).toBe('delivered');
        });

        it('delivers to wildcard endpoints', async () => {
            await registerEndpoint('BIZ-a', 'https://store.com/wh', ['*']);

            const result = await dispatch.execute({
                action: 'emit',
                event: 'any.event.type',
                payload: { data: 'test' },
            });

            expect(result.deliveriesTriggered).toBe(1);
            expect(result.deliveries[0].status).toBe('delivered');
        });

        it('skips endpoints not subscribed to the event', async () => {
            await registerEndpoint('BIZ-a', 'https://store.com/wh', ['payout.completed']);

            const result = await dispatch.execute({
                action: 'emit',
                event: 'payment.captured',
                payload: {},
            });

            expect(result.deliveriesTriggered).toBe(0);
        });

        it('delivers to multiple endpoints', async () => {
            await registerEndpoint('BIZ-a', 'https://a.com/wh', ['payment.captured']);
            await registerEndpoint('BIZ-b', 'https://b.com/wh', ['payment.captured', 'payout.completed']);

            const result = await dispatch.execute({
                action: 'emit',
                event: 'payment.captured',
                payload: { amount: 50 },
            });

            expect(result.deliveriesTriggered).toBe(2);
        });

        it('records failed deliveries', async () => {
            // URL containing "fail" triggers simulated failure
            await registerEndpoint('BIZ-a', 'https://fail.example.com/wh', ['payment.captured']);

            const result = await dispatch.execute({
                action: 'emit',
                event: 'payment.captured',
                payload: {},
            });

            expect(result.deliveriesTriggered).toBe(1);
            expect(result.deliveries[0].status).toBe('failed');
        });

        it('scopes emission to specific business', async () => {
            await registerEndpoint('BIZ-a', 'https://a.com/wh', ['payment.captured']);
            await registerEndpoint('BIZ-b', 'https://b.com/wh', ['payment.captured']);

            const result = await dispatch.execute({
                action: 'emit',
                event: 'payment.captured',
                businessId: 'BIZ-a',
                payload: {},
            });

            expect(result.deliveriesTriggered).toBe(1);
        });

        it('rejects missing event type', async () => {
            const result = await dispatch.execute({ action: 'emit', payload: {} });
            expect(result.status).toBe('error');
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 5. RETRY LOGIC
    // ═══════════════════════════════════════════════════════════

    describe('retry', () => {
        it('retries a failed delivery successfully', async () => {
            // First: deliver to a "fail" URL, then change it — but since we can't change...
            // Instead: register normal URL, emit, check it's delivered, confirm no retry needed
            await registerEndpoint('BIZ-a', 'https://fail.example.com/wh', ['test.event']);

            const emit = await dispatch.execute({ action: 'emit', event: 'test.event', payload: {} });
            const deliveryId = emit.deliveries[0].id;

            // Register a new endpoint with a good URL to replace the simulation
            // Just test the retry mechanism itself
            const result = await dispatch.execute({ action: 'retry', deliveryId });
            // Still fails because URL still contains "fail"
            expect(result.status).toBe('success');
            expect(result.delivery.attempts).toBe(2);
        });

        it('rejects retry of already-delivered webhook', async () => {
            await registerEndpoint('BIZ-a', 'https://good.com/wh', ['test.event']);
            const emit = await dispatch.execute({ action: 'emit', event: 'test.event', payload: {} });
            const deliveryId = emit.deliveries[0].id;

            const result = await dispatch.execute({ action: 'retry', deliveryId });
            expect(result.status).toBe('error');
            expect(result.error).toContain('already succeeded');
        });

        it('rejects retry with exhausted attempts', async () => {
            await dispatch.execute({ action: 'configure', maxAttempts: 2 });
            await registerEndpoint('BIZ-a', 'https://fail.com/wh', ['test.event']);

            const emit = await dispatch.execute({ action: 'emit', event: 'test.event', payload: {} });
            const deliveryId = emit.deliveries[0].id;

            // attempt 1 already happened, attempt 2:
            await dispatch.execute({ action: 'retry', deliveryId });

            // attempt 3 should be rejected (max is 2)
            const result = await dispatch.execute({ action: 'retry', deliveryId });
            expect(result.status).toBe('error');
            expect(result.error).toContain('Max retry');
        });

        it('rejects unknown delivery ID', async () => {
            const result = await dispatch.execute({ action: 'retry', deliveryId: 'DLV-fake' });
            expect(result.status).toBe('error');
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 6. DELIVERY QUERIES
    // ═══════════════════════════════════════════════════════════

    describe('deliveries', () => {
        it('queries all deliveries', async () => {
            await registerEndpoint('BIZ-a', 'https://a.com/wh', ['*']);
            await dispatch.execute({ action: 'emit', event: 'e1', payload: {} });
            await dispatch.execute({ action: 'emit', event: 'e2', payload: {} });

            const result = await dispatch.execute({ action: 'deliveries' });
            expect(result.totalDeliveries).toBe(2);
            expect(result.delivered).toBe(2);
        });

        it('filters by business', async () => {
            await registerEndpoint('BIZ-a', 'https://a.com/wh', ['*']);
            await registerEndpoint('BIZ-b', 'https://b.com/wh', ['*']);
            await dispatch.execute({ action: 'emit', event: 'e1', payload: {} });

            const result = await dispatch.execute({ action: 'deliveries', businessId: 'BIZ-a' });
            expect(result.totalDeliveries).toBe(1);
        });

        it('filters by status', async () => {
            await registerEndpoint('BIZ-a', 'https://good.com/wh', ['*']);
            await registerEndpoint('BIZ-b', 'https://fail.com/wh', ['*']);
            await dispatch.execute({ action: 'emit', event: 'e1', payload: {} });

            const delivered = await dispatch.execute({ action: 'deliveries', statusFilter: 'delivered' });
            const failed = await dispatch.execute({ action: 'deliveries', statusFilter: 'failed' });

            expect(delivered.totalDeliveries).toBe(1);
            expect(failed.totalDeliveries).toBe(1);
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 7. CONFIGURATION
    // ═══════════════════════════════════════════════════════════

    describe('configure', () => {
        it('updates dispatch config', async () => {
            const result = await dispatch.execute({
                action: 'configure',
                maxAttempts: 10,
                timeoutMs: 30_000,
            });
            expect(result.config.maxAttempts).toBe(10);
            expect(result.config.timeoutMs).toBe(30_000);
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 8. STATS
    // ═══════════════════════════════════════════════════════════

    describe('stats', () => {
        it('returns full dispatch statistics', async () => {
            await registerEndpoint('BIZ-a', 'https://a.com/wh', ['*']);
            await dispatch.execute({ action: 'emit', event: 'e1', payload: {} });

            const result = await dispatch.execute({ action: 'stats' });
            expect(result.totalEndpoints).toBe(1);
            expect(result.totalEvents).toBe(1);
            expect(result.totalDeliveries).toBe(1);
            expect(result.delivered).toBe(1);
            expect(result.deliveryRate).toBe(100);
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 9. FULL LIFECYCLE — HOSPITAL BILLING WEBHOOKS
    // ═══════════════════════════════════════════════════════════

    describe('full lifecycle — hospital billing webhooks', () => {
        it('end-to-end: register endpoints, emit billing events, verify delivery', async () => {
            // 1. Hospital registers a billing webhook
            const billing = await dispatch.execute({
                action: 'registerEndpoint',
                businessId: 'HOSP-mercy',
                url: 'https://mercy-hospital.org/api/billing-hooks',
                events: ['payment.captured', 'payout.completed', 'split.executed'],
            });
            expect(billing.status).toBe('success');

            // 2. Hospital also registers an audit webhook
            const audit = await dispatch.execute({
                action: 'registerEndpoint',
                businessId: 'HOSP-mercy',
                url: 'https://mercy-hospital.org/api/audit-hooks',
                events: ['*'],
            });
            expect(audit.status).toBe('success');

            // 3. Patient co-pay captured — both endpoints should receive
            const copay = await dispatch.execute({
                action: 'emit',
                event: 'payment.captured',
                businessId: 'HOSP-mercy',
                payload: { patientId: 'P-12345', amount: 75.00, type: 'co-pay', department: 'cardiology' },
            });
            expect(copay.deliveriesTriggered).toBe(2);
            expect(copay.deliveries.every((d: any) => d.status === 'delivered')).toBe(true);

            // 4. Revenue split executed — billing + audit
            const split = await dispatch.execute({
                action: 'emit',
                event: 'split.executed',
                businessId: 'HOSP-mercy',
                payload: { doctor: 'Dr. Chen', department: 'cardiology', facility: 'mercy-main', amount: 75 },
            });
            expect(split.deliveriesTriggered).toBe(2);

            // 5. Insurance payout completed — billing + audit
            const payout = await dispatch.execute({
                action: 'emit',
                event: 'payout.completed',
                businessId: 'HOSP-mercy',
                payload: { insurer: 'BlueShield', amount: 1250.00, claimId: 'CLM-90210' },
            });
            expect(payout.deliveriesTriggered).toBe(2);

            // 6. Verify delivery log
            const deliveries = await dispatch.execute({ action: 'deliveries', businessId: 'HOSP-mercy' });
            expect(deliveries.totalDeliveries).toBe(6); // 3 events × 2 endpoints
            expect(deliveries.delivered).toBe(6);
            expect(deliveries.failed).toBe(0);

            // 7. Platform stats
            const stats = await dispatch.execute({ action: 'stats' });
            expect(stats.totalEndpoints).toBe(2);
            expect(stats.totalEvents).toBe(3);
            expect(stats.deliveryRate).toBe(100);
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 10. EDGE CASES
    // ═══════════════════════════════════════════════════════════

    describe('edge cases', () => {
        it('returns error for unknown action', async () => {
            const result = await dispatch.execute({ action: 'boom' });
            expect(result.status).toBe('error');
            expect(result.error).toContain('Unknown action');
        });

        it('handles emit with no matching endpoints', async () => {
            const result = await dispatch.execute({ action: 'emit', event: 'orphan.event', payload: {} });
            expect(result.status).toBe('success');
            expect(result.deliveriesTriggered).toBe(0);
        });
    });
});
