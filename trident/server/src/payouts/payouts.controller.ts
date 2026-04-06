import { Request, Response } from "express";
import * as PayoutsService from "./payouts.service";
import { PayoutRequestSchema } from "../validation/payouts.schema";

export const requestPayout = async (req: Request, res: Response) => {
    const result = PayoutRequestSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: "Invalid payout request", details: result.error.errors });
    }
    const payout = await PayoutsService.requestPayout({ ...result.data, userId: req.user?.id });
    res.status(201).json({ success: true, data: payout });
};

export const getPayoutBalance = async (req: Request, res: Response) => {
    const balance = await PayoutsService.getPayoutBalance({ userId: req.user?.id });
    res.status(200).json({ success: true, data: balance });
};
