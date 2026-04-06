export interface ApexPayload {
    [key: string]: any;
}

export interface ApexResult {
    ok: boolean;
    message: string;
    data?: any;
    error?: string;
}
