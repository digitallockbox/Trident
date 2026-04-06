import { z } from 'zod';
export const AegisPayloadSchema = z.object({
    text: z.string(),
    mode: z.enum(['analyze', 'verify']).default('analyze'),
});
export const AegisResultSchema = z.object({
    verdict: z.string(),
    confidence: z.number().min(0).max(1),
});
export const AegisContract = {
    name: 'aegis',
    payload: AegisPayloadSchema,
    result: AegisResultSchema,
};
