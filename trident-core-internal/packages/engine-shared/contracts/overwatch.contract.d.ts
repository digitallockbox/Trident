import { z } from 'zod';
export declare const OverwatchPayloadSchema: z.ZodObject<{
    target: z.ZodString;
    depth: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    target: string;
    depth: number;
}, {
    target: string;
    depth?: number | undefined;
}>;
export type OverwatchPayload = z.infer<typeof OverwatchPayloadSchema>;
export declare const OverwatchResultSchema: z.ZodObject<{
    status: z.ZodString;
    details: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    status: string;
    details: string[];
}, {
    status: string;
    details: string[];
}>;
export type OverwatchResult = z.infer<typeof OverwatchResultSchema>;
export declare const OverwatchContract: {
    name: string;
    payload: z.ZodObject<{
        target: z.ZodString;
        depth: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        target: string;
        depth: number;
    }, {
        target: string;
        depth?: number | undefined;
    }>;
    result: z.ZodObject<{
        status: z.ZodString;
        details: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        status: string;
        details: string[];
    }, {
        status: string;
        details: string[];
    }>;
};
