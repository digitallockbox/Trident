import { z } from "zod";

export const OmegaPayoutRequestSchema = z.object({
    toWallet: z.string().min(32).max(64),
    amountLamports: z.number().int().positive(),
    tokenMint: z.string().min(32).max(64).optional(),
    referenceId: z.string().uuid().optional(),
});

export const OmegaStateSchema = z.object({
    enabled: z.boolean().default(true),
});

export type OmegaPayoutRequest = z.infer<typeof OmegaPayoutRequestSchema>;
export type OmegaState = z.infer<typeof OmegaStateSchema>;
