import { z } from 'zod';

export const OverwatchPayloadSchema = z.object({
    target: z.string(),
    depth: z.number().min(1).max(5).default(1),
});

export type OverwatchPayload = z.infer<typeof OverwatchPayloadSchema>;

export const OverwatchResultSchema = z.object({
    status: z.string(),
    details: z.array(z.string()),
});

export type OverwatchResult = z.infer<typeof OverwatchResultSchema>;

export const OverwatchContract = {
    name: 'overwatch',
    payload: OverwatchPayloadSchema,
    result: OverwatchResultSchema,
};
