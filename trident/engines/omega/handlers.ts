import { PayoutsService } from '../../backend/services/payouts.service';
import { validatePayout } from './logic';
import type { Request, Response } from 'express';

export async function payoutHandler(req: Request, res: Response) {
    try {
        const { tenant, solanaPublicKey, payload } = req as any;
        const { amount } = payload;
        if (!validatePayout(amount)) {
            return res.status(400).json({ error: 'Invalid payout amount' });
        }
        const payout = await PayoutsService.requestPayout(tenant, solanaPublicKey, amount);
        res.status(201).json({ payout });
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
}
