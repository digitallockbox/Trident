import { z } from 'zod';
export declare const AegisPayloadSchema: z.ZodObject<{
    text: z.ZodString;
    mode: z.ZodDefault<z.ZodEnum<["analyze", "verify"]>>;
}, "strip", z.ZodTypeAny, {
    text: string;
    mode: "analyze" | "verify";
}, {
    text: string;
    mode?: "analyze" | "verify" | undefined;
}>;
export type AegisPayload = z.infer<typeof AegisPayloadSchema>;
export declare const AegisResultSchema: z.ZodObject<{
    verdict: z.ZodString;
    confidence: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    verdict: string;
    confidence: number;
}, {
    verdict: string;
    confidence: number;
}>;
export type AegisResult = z.infer<typeof AegisResultSchema>;
export declare const AegisContract: {
    name: string;
    payload: z.ZodObject<{
        text: z.ZodString;
        mode: z.ZodDefault<z.ZodEnum<["analyze", "verify"]>>;
    }, "strip", z.ZodTypeAny, {
        text: string;
        mode: "analyze" | "verify";
    }, {
        text: string;
        mode?: "analyze" | "verify" | undefined;
    }>;
    result: z.ZodObject<{
        verdict: z.ZodString;
        confidence: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        verdict: string;
        confidence: number;
    }, {
        verdict: string;
        confidence: number;
    }>;
};
