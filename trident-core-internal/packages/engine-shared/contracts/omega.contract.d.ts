import { z } from 'zod';
export declare const OmegaPayloadSchema: z.ZodObject<{
    input: z.ZodString;
}, "strip", z.ZodTypeAny, {
    input: string;
}, {
    input: string;
}>;
export type OmegaPayload = z.infer<typeof OmegaPayloadSchema>;
export declare const OmegaResultSchema: z.ZodObject<{
    output: z.ZodString;
    meta: z.ZodObject<{
        processedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        processedAt: string;
    }, {
        processedAt: string;
    }>;
}, "strip", z.ZodTypeAny, {
    output: string;
    meta: {
        processedAt: string;
    };
}, {
    output: string;
    meta: {
        processedAt: string;
    };
}>;
export type OmegaResult = z.infer<typeof OmegaResultSchema>;
export declare const OmegaContract: {
    name: string;
    payload: z.ZodObject<{
        input: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        input: string;
    }, {
        input: string;
    }>;
    result: z.ZodObject<{
        output: z.ZodString;
        meta: z.ZodObject<{
            processedAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            processedAt: string;
        }, {
            processedAt: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        output: string;
        meta: {
            processedAt: string;
        };
    }, {
        output: string;
        meta: {
            processedAt: string;
        };
    }>;
};
