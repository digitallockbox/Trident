/**
 * Dispatch — Webhook Dispatch Engine
 *
 * Event-driven notification system for businesses integrating via API.
 * When payment events (captured, split, payout) occur, Dispatch
 * delivers webhook notifications with retry logic, signing, and
 * delivery tracking.
 *
 * Core flow:
 *   1. Business registers a webhook endpoint
 *   2. Platform events are emitted (payment.captured, payout.completed, etc.)
 *   3. Dispatch delivers the payload to the endpoint
 *   4. Failed deliveries are retried with exponential backoff
 *   5. Delivery history is tracked per endpoint
 *
 * Actions:
 *   registerEndpoint   — Register a webhook URL for a business
 *   removeEndpoint     — Remove a registered endpoint
 *   listEndpoints      — List all endpoints for a business
 *   emit               — Emit an event (triggers delivery to matching endpoints)
 *   retry              — Manually retry a failed delivery
 *   deliveries         — Query delivery history
 *   configure          — Update dispatch settings
 *   stats              — Platform-wide dispatch statistics
 */
export class Dispatch {
    // ── Endpoint registry ────────────────────────────────────
    private endpoints: Map<string, {
        id: string;
        businessId: string;
        url: string;
        events: string[];         // e.g. ['payment.captured', 'payout.completed', '*']
        secret: string;           // HMAC signing secret
        active: boolean;
        createdAt: string;
    }> = new Map();

    // ── Delivery log ─────────────────────────────────────────
    private deliveries: Array<{
        id: string;
        endpointId: string;
        businessId: string;
        event: string;
        payload: Record<string, any>;
        status: 'delivered' | 'failed' | 'pending' | 'retrying';
        attempts: number;
        maxAttempts: number;
        lastAttemptAt: string;
        nextRetryAt: string | null;
        responseCode: number | null;
        error: string | null;
        createdAt: string;
    }> = [];

    // ── Event log ────────────────────────────────────────────
    private events: Array<{
        id: string;
        event: string;
        payload: Record<string, any>;
        deliveriesTriggered: number;
        timestamp: string;
    }> = [];

    // ── Configuration ────────────────────────────────────────
    private config = {
        maxAttempts: 5,
        initialRetryDelayMs: 1000,
        maxRetryDelayMs: 300_000,           // 5 minutes
        timeoutMs: 10_000,
        maxEndpointsPerBusiness: 10,
        signatureHeader: 'x-trident-signature',
    };

    // ═══════════════════════════════════════════════════════════
    async execute(data: Record<string, any>): Promise<Record<string, any>> {
        const action = data.action || 'stats';

        switch (action) {
            case 'registerEndpoint': return this.registerEndpoint(data);
            case 'removeEndpoint': return this.removeEndpoint(data);
            case 'listEndpoints': return this.listEndpoints(data);
            case 'emit': return this.emitEvent(data);
            case 'retry': return this.retryDelivery(data);
            case 'deliveries': return this.getDeliveries(data);
            case 'configure': return this.updateConfig(data);
            case 'stats': return this.getStats();
            default:
                return { status: 'error', engine: 'Dispatch', error: `Unknown action: ${action}` };
        }
    }

    // ── 1. Register webhook endpoint ─────────────────────────

    private registerEndpoint(data: Record<string, any>): Record<string, any> {
        const businessId = data.businessId as string;
        const url = data.url as string;
        const events = data.events as string[] | undefined;

        if (!businessId) return { status: 'error', engine: 'Dispatch', error: 'Missing businessId' };
        if (!url) return { status: 'error', engine: 'Dispatch', error: 'Missing webhook URL' };
        if (!this.isValidUrl(url)) return { status: 'error', engine: 'Dispatch', error: 'Invalid URL format' };
        if (!events || !Array.isArray(events) || events.length === 0)
            return { status: 'error', engine: 'Dispatch', error: 'At least one event type required' };

        // Check per-business limit
        const businessEndpoints = Array.from(this.endpoints.values()).filter(
            (e) => e.businessId === businessId
        );
        if (businessEndpoints.length >= this.config.maxEndpointsPerBusiness) {
            return { status: 'error', engine: 'Dispatch', error: `Maximum ${this.config.maxEndpointsPerBusiness} endpoints per business` };
        }

        // Check for duplicate URL
        const duplicate = businessEndpoints.find((e) => e.url === url);
        if (duplicate) {
            return { status: 'error', engine: 'Dispatch', error: 'Endpoint URL already registered for this business' };
        }

        const id = `WH-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const secret = `whsec_${this.generateSecret(32)}`;

        this.endpoints.set(id, {
            id,
            businessId,
            url,
            events,
            secret,
            active: true,
            createdAt: new Date().toISOString(),
        });

        return {
            status: 'success',
            engine: 'Dispatch',
            endpoint: { id, businessId, url, events, active: true },
            secret,
        };
    }

    // ── 2. Remove endpoint ───────────────────────────────────

    private removeEndpoint(data: Record<string, any>): Record<string, any> {
        const endpointId = data.endpointId as string;
        if (!endpointId) return { status: 'error', engine: 'Dispatch', error: 'Missing endpointId' };

        const endpoint = this.endpoints.get(endpointId);
        if (!endpoint) return { status: 'error', engine: 'Dispatch', error: 'Endpoint not found' };

        this.endpoints.delete(endpointId);
        return { status: 'success', engine: 'Dispatch', removed: endpointId };
    }

    // ── 3. List endpoints ────────────────────────────────────

    private listEndpoints(data: Record<string, any>): Record<string, any> {
        const businessId = data.businessId as string;

        let eps = Array.from(this.endpoints.values());
        if (businessId) eps = eps.filter((e) => e.businessId === businessId);

        return {
            status: 'success',
            engine: 'Dispatch',
            totalEndpoints: eps.length,
            endpoints: eps.map((e) => ({
                id: e.id,
                businessId: e.businessId,
                url: e.url,
                events: e.events,
                active: e.active,
                createdAt: e.createdAt,
            })),
        };
    }

    // ── 4. Emit event ────────────────────────────────────────

    private emitEvent(data: Record<string, any>): Record<string, any> {
        const event = data.event as string;
        const payload = data.payload || {};
        const businessId = data.businessId as string;

        if (!event) return { status: 'error', engine: 'Dispatch', error: 'Missing event type' };

        // Find matching endpoints
        let matchingEndpoints = Array.from(this.endpoints.values()).filter(
            (ep) => ep.active && (ep.events.includes(event) || ep.events.includes('*'))
        );

        if (businessId) {
            matchingEndpoints = matchingEndpoints.filter((ep) => ep.businessId === businessId);
        }

        const eventId = `EVT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const deliveriesCreated: Array<{ id: string; endpointId: string; url: string; status: string }> = [];

        for (const ep of matchingEndpoints) {
            const deliveryId = `DLV-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            const now = new Date().toISOString();

            // Simulate delivery — in production this would be an HTTP POST with HMAC signature
            const delivered = this.simulateDelivery(ep.url);

            this.deliveries.push({
                id: deliveryId,
                endpointId: ep.id,
                businessId: ep.businessId,
                event,
                payload: { ...payload, eventId, event, timestamp: now },
                status: delivered ? 'delivered' : 'failed',
                attempts: 1,
                maxAttempts: this.config.maxAttempts,
                lastAttemptAt: now,
                nextRetryAt: delivered ? null : this.calculateNextRetry(1),
                responseCode: delivered ? 200 : null,
                error: delivered ? null : 'Simulated delivery failure',
                createdAt: now,
            });

            deliveriesCreated.push({
                id: deliveryId,
                endpointId: ep.id,
                url: ep.url,
                status: delivered ? 'delivered' : 'failed',
            });
        }

        this.events.push({
            id: eventId,
            event,
            payload,
            deliveriesTriggered: deliveriesCreated.length,
            timestamp: new Date().toISOString(),
        });

        return {
            status: 'success',
            engine: 'Dispatch',
            eventId,
            event,
            deliveriesTriggered: deliveriesCreated.length,
            deliveries: deliveriesCreated,
        };
    }

    // ── 5. Retry delivery ────────────────────────────────────

    private retryDelivery(data: Record<string, any>): Record<string, any> {
        const deliveryId = data.deliveryId as string;
        if (!deliveryId) return { status: 'error', engine: 'Dispatch', error: 'Missing deliveryId' };

        const delivery = this.deliveries.find((d) => d.id === deliveryId);
        if (!delivery) return { status: 'error', engine: 'Dispatch', error: 'Delivery not found' };

        if (delivery.status === 'delivered') {
            return { status: 'error', engine: 'Dispatch', error: 'Delivery already succeeded' };
        }

        if (delivery.attempts >= delivery.maxAttempts) {
            return { status: 'error', engine: 'Dispatch', error: 'Max retry attempts exhausted' };
        }

        // Simulate retry
        delivery.attempts += 1;
        delivery.lastAttemptAt = new Date().toISOString();

        const success = this.simulateDelivery(
            this.endpoints.get(delivery.endpointId)?.url || ''
        );

        if (success) {
            delivery.status = 'delivered';
            delivery.responseCode = 200;
            delivery.error = null;
            delivery.nextRetryAt = null;
        } else {
            delivery.status = delivery.attempts >= delivery.maxAttempts ? 'failed' : 'retrying';
            delivery.nextRetryAt = delivery.attempts < delivery.maxAttempts
                ? this.calculateNextRetry(delivery.attempts)
                : null;
        }

        return {
            status: 'success',
            engine: 'Dispatch',
            delivery: {
                id: delivery.id,
                status: delivery.status,
                attempts: delivery.attempts,
                maxAttempts: delivery.maxAttempts,
                nextRetryAt: delivery.nextRetryAt,
            },
        };
    }

    // ── 6. Query deliveries ──────────────────────────────────

    private getDeliveries(data: Record<string, any>): Record<string, any> {
        const businessId = data.businessId as string;
        const endpointId = data.endpointId as string;
        const event = data.event as string;
        const statusFilter = data.statusFilter as string;
        const limit = Math.min(Number(data.limit) || 50, 500);

        let results = this.deliveries;
        if (businessId) results = results.filter((d) => d.businessId === businessId);
        if (endpointId) results = results.filter((d) => d.endpointId === endpointId);
        if (event) results = results.filter((d) => d.event === event);
        if (statusFilter) results = results.filter((d) => d.status === statusFilter);

        const delivered = results.filter((d) => d.status === 'delivered').length;
        const failed = results.filter((d) => d.status === 'failed').length;

        return {
            status: 'success',
            engine: 'Dispatch',
            totalDeliveries: results.length,
            delivered,
            failed,
            deliveries: results.slice(-limit).map((d) => ({
                id: d.id,
                event: d.event,
                status: d.status,
                attempts: d.attempts,
                responseCode: d.responseCode,
                lastAttemptAt: d.lastAttemptAt,
            })),
        };
    }

    // ── 7. Configuration ─────────────────────────────────────

    private updateConfig(data: Record<string, any>): Record<string, any> {
        if (data.maxAttempts !== undefined) this.config.maxAttempts = Number(data.maxAttempts);
        if (data.initialRetryDelayMs !== undefined) this.config.initialRetryDelayMs = Number(data.initialRetryDelayMs);
        if (data.maxRetryDelayMs !== undefined) this.config.maxRetryDelayMs = Number(data.maxRetryDelayMs);
        if (data.timeoutMs !== undefined) this.config.timeoutMs = Number(data.timeoutMs);
        if (data.maxEndpointsPerBusiness !== undefined)
            this.config.maxEndpointsPerBusiness = Number(data.maxEndpointsPerBusiness);

        return { status: 'success', engine: 'Dispatch', config: { ...this.config } };
    }

    // ── 8. Stats ─────────────────────────────────────────────

    private getStats(): Record<string, any> {
        const totalDelivered = this.deliveries.filter((d) => d.status === 'delivered').length;
        const totalFailed = this.deliveries.filter((d) => d.status === 'failed').length;
        const totalPending = this.deliveries.filter((d) => d.status === 'pending' || d.status === 'retrying').length;

        return {
            status: 'success',
            engine: 'Dispatch',
            totalEndpoints: this.endpoints.size,
            totalEvents: this.events.length,
            totalDeliveries: this.deliveries.length,
            delivered: totalDelivered,
            failed: totalFailed,
            pending: totalPending,
            deliveryRate: this.deliveries.length > 0
                ? Math.round((totalDelivered / this.deliveries.length) * 10000) / 100
                : 100,
            config: { ...this.config },
        };
    }

    // ── Helpers ──────────────────────────────────────────────

    private isValidUrl(url: string): boolean {
        try {
            const parsed = new URL(url);
            return parsed.protocol === 'https:' || parsed.protocol === 'http:';
        } catch {
            return false;
        }
    }

    private generateSecret(length: number): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    private simulateDelivery(url: string): boolean {
        // In production: HTTP POST with HMAC-signed body, timeout, retry
        // Simulation: succeed unless URL contains "fail"
        return !url.includes('fail');
    }

    private calculateNextRetry(attempt: number): string {
        const delay = Math.min(
            this.config.initialRetryDelayMs * Math.pow(2, attempt - 1),
            this.config.maxRetryDelayMs
        );
        return new Date(Date.now() + delay).toISOString();
    }
}
