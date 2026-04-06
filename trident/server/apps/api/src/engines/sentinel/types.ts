export interface SentinelPayload {
    [key: string]: any;
}

export interface SentinelResult {
    ok: boolean;
    message: string;
    data?: any;
    error?: string;
}
