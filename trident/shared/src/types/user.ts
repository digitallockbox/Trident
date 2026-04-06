/**
 * User entity representing a Trident platform member
 * Synced from backend Prisma schema
 */
export interface User {
    id: string;
    wallet: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    score: number;
    createdAt: string;
    updatedAt: string;
}

/**
 * User profile data returned from /profile endpoint
 * Includes computed fields and related data
 */
export interface UserProfile extends User {
    totalPayouts: number;
    pendingClaims: number;
    reputationScore: number;
}
