export interface OverwatchPayload {
    [key: string]: any;
}

export interface OverwatchResult {
    ok: boolean;
    message: string;
    data?: any;
    error?: string;
}
