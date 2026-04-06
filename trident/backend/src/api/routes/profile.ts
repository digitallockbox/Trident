import { Router, type Request, type Response } from 'express';
import { UserProfile } from '@shared/types';

const router = Router();

/**
 * GET /profile
 * Returns the authenticated user's profile with computed fields
 * 
 * Example response:
 * {
 *   "id": "user-123",
 *   "wallet": "4z5HGDZNqZ...",
 *   "tier": "gold",
 *   "score": 950,
 *   "totalPayouts": 42,
 *   "pendingClaims": 3,
 *   "reputationScore": 950,
 *   "createdAt": "2024-01-15T10:30:00Z",
 *   "updatedAt": "2024-01-28T14:22:00Z"
 * }
 */
router.get('/', async (req: Request, res: Response<UserProfile>) => {
    try {
        // TODO: Extract user from auth middleware (e.g., req.user)
        // For now, return a mock profile

        const userProfile: UserProfile = {
            id: 'user-demo-001',
            wallet: '4z5HGDZNqZ...',
            tier: 'gold',
            score: 950,
            totalPayouts: 42,
            pendingClaims: 3,
            reputationScore: 950,
            createdAt: new Date('2024-01-15T10:30:00Z').toISOString(),
            updatedAt: new Date('2024-01-28T14:22:00Z').toISOString(),
        };

        res.json(userProfile);
    } catch (error) {
        res.status(500).json({
            id: '',
            wallet: '',
            tier: 'bronze',
            score: 0,
            totalPayouts: 0,
            pendingClaims: 0,
            reputationScore: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
    }
});

export default router;
