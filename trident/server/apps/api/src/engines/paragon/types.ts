// Types for Paragon engine

export interface ParagonPayload {
    // Define the expected input shape
    [key: string]: any;
}

export interface ParagonResult {
    ok: boolean;
    message: string;
    data?: any;
    error?: string;
}
