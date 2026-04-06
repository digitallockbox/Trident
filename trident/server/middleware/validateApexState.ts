import { Request, Response, NextFunction } from "express";
import { ApexStateSchema } from "../../frontend/src/utils/apex.schema";

export function validateApexState(req: Request, res: Response, next: NextFunction) {
    // Assumes req.hybridAuthMessage is set by validateHybridAuthMessage
    const payload = (req as any).hybridAuthMessage?.payload;
    const result = ApexStateSchema.safeParse(payload);
    if (!result.success) {
        return res.status(400).json({ error: "Invalid Apex state payload", details: result.error.errors });
    }
    (req as any).apexState = result.data;
    next();
}
