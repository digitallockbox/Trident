export interface ContinuumPayload {
    [key: string]: any;
}

export interface ContinuumResult {
    ok: boolean;
    message: string;
    data?: any;
    error?: string;
}
