export interface AscendantPayload {
    [key: string]: any;
}

export interface AscendantResult {
    ok: boolean;
    message: string;
    data?: any;
    error?: string;
}
