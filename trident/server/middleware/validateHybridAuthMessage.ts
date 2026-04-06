import { Request, Response, NextFunction } from "express";
import { HybridAuthMessageSchema } from "../utils/hybridAuth.schema";

export function validateHybridAuthMessage(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const rawMessage = req.headers["x-solana-message"];

    // Ensure header exists and is a string
    if (!rawMessage || typeof rawMessage !== "string") {
        return res
            .status(400)
            .json({ error: "Missing or invalid x-solana-message header" });
    }

    let parsed;
    try {
        parsed = JSON.parse(rawMessage);
    } catch {
        return res
            .status(400)
            .json({ error: "Malformed x-solana-message JSON" });
    }

    // Validate using Zod
    const result = HybridAuthMessageSchema.safeParse(parsed);

    if (!result.success) {
        return res.status(400).json({
            error: "Invalid hybrid auth message",
            details: result.error.errors,
        });
    }

    // Attach validated + typed message to request
    (req as any).hybridAuthMessage = result.data;

    next();
}
