import { z } from 'zod';

export const AegisPayloadSchema = z.object({
    text: z.string(),
    mode: z.enum(['analyze', 'verify']).default('analyze'),
});

export type AegisPayload = z.infer<typeof AegisPayloadSchema>;

export const AegisResultSchema = z.object({
    verdict: z.string(),
    confidence: z.number().min(0).max(1),
});

export type AegisResult = z.infer<typeof AegisResultSchema>;

export const AegisContract = {
    name: 'aegis',
    payload: AegisPayloadSchema,
    result: AegisResultSchema,
};
