export interface AegisPayload {
    [key: string]: any;
}

export interface AegisResult {
    ok: boolean;
    message: string;
    data?: any;
    error?: string;
}
