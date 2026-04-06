import { z } from 'zod';

export const OmegaPayloadSchema = z.object({
    input: z.string().min(1),
});

export type OmegaPayload = z.infer<typeof OmegaPayloadSchema>;

export const OmegaResultSchema = z.object({
    output: z.string(),
    meta: z.object({
        processedAt: z.string(),
    }),
});

export type OmegaResult = z.infer<typeof OmegaResultSchema>;

export const OmegaContract = {
    name: 'omega',
    payload: OmegaPayloadSchema,
    result: OmegaResultSchema,
};
