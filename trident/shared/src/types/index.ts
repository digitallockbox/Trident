// Re-export all shared types for convenient importing
export * from './user';
export * from './payout';
export * from './cycle';
export * from './webhook';

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    meta?: {
        timestamp: string;
        version: string;
    };
}

/**
 * Paginated response for list endpoints
 */
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}
