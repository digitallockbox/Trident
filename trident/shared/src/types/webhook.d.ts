/**
 * Webhook event types for Helius/Solana transaction monitoring
 */
export declare enum WebhookEventType {
    Transaction = "TRANSACTION",
    TokenTransfer = "TOKEN_TRANSFER",
    Fraud = "FRAUD",
    Error = "ERROR"
}
/**
 * Helius webhook payload for transaction events
 */
export interface HeliusWebhookPayload {
    transaction: {
        signature: string;
        slot: number;
        timestamp: number;
        source: string;
        type: string;
        status: 'success' | 'failed';
    };
    events: Array<{
        type: string;
        data: Record<string, unknown>;
    }>;
}
/**
 * Fraud event entity for tracking suspicious activity
 */
export interface FraudEvent {
    id: string;
    userId: string;
    eventType: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    detailsJson: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}
/**
 * Webhook event response
 */
export interface WebhookResponse {
    success: boolean;
    eventId: string;
    processed: boolean;
}
//# sourceMappingURL=webhook.d.ts.map