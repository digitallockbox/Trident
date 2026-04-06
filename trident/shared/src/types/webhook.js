/**
 * Webhook event types for Helius/Solana transaction monitoring
 */
export var WebhookEventType;
(function (WebhookEventType) {
    WebhookEventType["Transaction"] = "TRANSACTION";
    WebhookEventType["TokenTransfer"] = "TOKEN_TRANSFER";
    WebhookEventType["Fraud"] = "FRAUD";
    WebhookEventType["Error"] = "ERROR";
})(WebhookEventType || (WebhookEventType = {}));
//# sourceMappingURL=webhook.js.map