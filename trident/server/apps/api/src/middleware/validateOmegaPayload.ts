import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const OmegaPayloadSchema = z.object({
    userId: z.string(),
    context: z.record(z.any()).optional(),
    metadata: z.record(z.any()).optional(),
});

export function validateOmegaPayload(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const result = OmegaPayloadSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            ok: false,
            error: 'Invalid Omega payload',
            details: result.error.errors,
        });
    }
    (req as any).omegaPayload = result.data;
    next();
}
