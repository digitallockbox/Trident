import { Request, Response, NextFunction } from "express";
import { AscendStateSchema } from "../../frontend/src/utils/ascend.schema";

export function validateAscendState(req: Request, res: Response, next: NextFunction) {
    // Assumes req.hybridAuthMessage is set by validateHybridAuthMessage
    const payload = (req as any).hybridAuthMessage?.payload;
    const result = AscendStateSchema.safeParse(payload);
    if (!result.success) {
        return res.status(400).json({ error: "Invalid Ascend state payload", details: result.error.errors });
    }
    (req as any).ascendState = result.data;
    next();
}
