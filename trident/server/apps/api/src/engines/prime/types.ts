export interface PrimePayload {
    [key: string]: any;
}

export interface PrimeResult {
    ok: boolean;
    message: string;
    data?: any;
    error?: string;
}
