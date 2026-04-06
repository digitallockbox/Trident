export interface OverwatchPayload {
    action: string;
    [key: string]: unknown;
}

export interface OverwatchResult {
    ok: boolean;
    message: string;
    data?: unknown;
    error?: string;
}
