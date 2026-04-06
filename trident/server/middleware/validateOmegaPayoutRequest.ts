import { Request, Response, NextFunction } from "express";
import { OmegaPayoutRequestSchema } from "../../frontend/src/utils/omega.schema";

export function validateOmegaPayoutRequest(req: Request, res: Response, next: NextFunction) {
    // Assumes req.hybridAuthMessage is set by validateHybridAuthMessage
    const payload = (req as any).hybridAuthMessage?.payload;
    const result = OmegaPayoutRequestSchema.safeParse(payload);
    if (!result.success) {
        return res.status(400).json({ error: "Invalid Omega payout request payload", details: result.error.errors });
    }
    (req as any).omegaPayoutRequest = result.data;
    next();
}
