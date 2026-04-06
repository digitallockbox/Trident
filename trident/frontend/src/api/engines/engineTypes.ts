// Shared engine response type for all engines
export interface EngineResponse<T = any> {
    ok: boolean;
    message: string;
    data?: T;
    error?: string;
}

// Aegis
export interface AegisPayload {
    [key: string]: any;
}

// Paragon
export interface ParagonPayload {
    [key: string]: any;
}

// Apex
export interface ApexPayload {
    [key: string]: any;
}

// Omega
export interface OmegaPayload {
    [key: string]: any;
}

// Prime
export interface PrimePayload {
    [key: string]: any;
}

// Podcast (matches backend Zod schema)
export interface PodcastPayload {
    title: string;
    description?: string;
    host: string;
    guests?: string[];
    publishDate?: string;
    audioUrl: string;
    durationSeconds: number;
    tags?: string[];
    livestreamId: string;
}
