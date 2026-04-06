export interface FusionPayload {
    [key: string]: any;
}

export interface FusionResult {
    ok: boolean;
    message: string;
    data?: any;
    error?: string;
}
