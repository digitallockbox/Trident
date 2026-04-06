export interface OmegaPayload {
    userId: string;
    context?: Record<string, any>;
    metadata?: Record<string, any>;
}

export interface OmegaResult {
    ok: boolean;
    message: string;
    data: any;
}
