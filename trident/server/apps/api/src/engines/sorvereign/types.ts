// Types for Sorvereign engine

export interface SorvereignPayload {
    // Define the expected input shape
    [key: string]: any;
}

export interface SorvereignResult {
    ok: boolean;
    message: string;
    data?: any;
    error?: string;
}
