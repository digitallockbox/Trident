export interface AscendPayload {
    [key: string]: any;
}

export interface AscendResult {
    ok: boolean;
    message: string;
    data?: any;
    error?: string;
}
