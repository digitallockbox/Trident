/**
 * Cycle entity representing a rewards distribution period
 * Synced from backend Prisma schema
 */
export interface Cycle {
    id: string;
    cycleNumber: number;
    startsAt: string;
    endsAt: string;
    closed: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Cycle status summary
 */
export interface CycleStatus {
    current: Cycle | null;
    next: Cycle | null;
    isOpen: boolean;
    daysRemaining: number;
}
