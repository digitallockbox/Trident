// Types for Router engine

export interface RouterPayload {
    // Define the expected input shape
    [key: string]: any;
}

export interface RouterResult {
    ok: boolean;
    message: string;
    data?: any;
    error?: string;
}
