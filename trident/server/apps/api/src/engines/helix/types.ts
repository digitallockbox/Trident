export interface HelixPayload {
    [key: string]: any;
}

export interface HelixResult {
    ok: boolean;
    message: string;
    data?: any;
    error?: string;
}
