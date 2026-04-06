import { z } from "zod";

export const AscendStateSchema = z.object({
    enabled: z.boolean().default(false),
});

export type AscendState = z.infer<typeof AscendStateSchema>;
