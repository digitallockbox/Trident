import { Router, type Request, type Response } from 'express';
import { ClaimResponse, Payout, PayoutStatus } from '@shared/types';

const router = Router();

/**
 * POST /claim
 * Claims pending rewards for the authenticated user
 * 
 * Request body (optional):
 * {
 *   "cycleId": "cycle-456",
 *   "amount": "100.50000000"
 * }
 * 
 * Example response:
 * {
 *   "success": true,
 *   "payout": {
 *     "id": "payout-789",
 *     "userId": "user-123",
 *     "amount": "100.50000000",
 *     "tokenMint": "STREAMING...",
 *     "txSignature": "5Af...",
 *     "status": "COMPLETED",
 *     "cycleId": "cycle-456",
 *     "createdAt": "2024-01-28T14:22:00Z",
 *     "updatedAt": "2024-01-28T14:22:00Z"
 *   },
 *   "txSignature": "5Af..."
 * }
 */
router.post('/', async (req: Request, res: Response<ClaimResponse>) => {
    try {
        // TODO: Extract user from auth middleware (e.g., req.user)
        // TODO: Validate claim amount and user balance
        // TODO: Submit Solana transaction
        // TODO: Store payout record in Prisma

        const mockPayout: Payout = {
            id: 'payout-789',
            userId: 'user-demo-001',
            amount: '100.50000000',
            tokenMint: 'STREAMING...',
            txSignature: '5Af...',
            status: PayoutStatus.Completed,
            cycleId: 'cycle-456',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const response: ClaimResponse = {
            success: true,
            payout: mockPayout,
            txSignature: mockPayout.txSignature || 'pending',
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({
            success: false,
            payout: {
                id: '',
                userId: '',
                amount: '0',
                tokenMint: '',
                txSignature: null,
                status: PayoutStatus.Failed,
                cycleId: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            txSignature: '',
        });
    }
});

export default router;

