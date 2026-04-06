import { z } from 'zod';
export const OverwatchPayloadSchema = z.object({
    target: z.string(),
    depth: z.number().min(1).max(5).default(1),
});
export const OverwatchResultSchema = z.object({
    status: z.string(),
    details: z.array(z.string()),
});
export const OverwatchContract = {
    name: 'overwatch',
    payload: OverwatchPayloadSchema,
    result: OverwatchResultSchema,
};
