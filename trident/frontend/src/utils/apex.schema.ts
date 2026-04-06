import { z } from "zod";

export const ApexSplitRuleSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(64),
    percentage: z.number().min(0).max(100),
    recipient: z.string().min(32).max(64), // wallet or account ID
});

export const ApexStateSchema = z.object({
    enabled: z.boolean().default(false),
    rules: z.array(ApexSplitRuleSchema).default([]),
});

export type ApexState = z.infer<typeof ApexStateSchema>;
