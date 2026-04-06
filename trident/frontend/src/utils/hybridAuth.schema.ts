import { z } from "zod";

export const HybridAuthMessageSchema = z.object({
    nonce: z.string().min(8).max(128),
    timestamp: z.number().int().positive(),
    action: z.string().min(1).max(128),
    payload: z.unknown(), // validated per-engine
});

export type HybridAuthMessage = z.infer<typeof HybridAuthMessageSchema>;
