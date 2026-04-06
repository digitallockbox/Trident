export interface OmegaPayload {
    [key: string]: any;
}

export interface OmegaResult {
    ok: boolean;
    message: string;
    data?: any;
    error?: string;
}
