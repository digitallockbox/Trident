
import { z } from "zod";

/**
 * Zod schema for starting a stream.
 * Validates title and category are non-empty strings.
 */
export const StreamStartSchema = z.object({
    title: z
        .string({ required_error: "title is required", invalid_type_error: "title must be a string" })
        .min(1, "title cannot be empty"),
    category: z
        .string({ required_error: "category is required", invalid_type_error: "category must be a string" })
        .min(1, "category cannot be empty")
});

/**
 * Zod schema for stopping a stream.
 * Validates streamId is a non-empty string.
 */
export const StreamStopSchema = z.object({
    streamId: z
        .string({ required_error: "streamId is required", invalid_type_error: "streamId must be a string" })
        .min(1, "streamId cannot be empty")
});


// --- Express Validator Middleware ---
import { Request, Response, NextFunction } from "express";

/**
 * Express middleware to validate stream start payloads.
 * Attaches validated data to req.streamStart.
 */
export function validateStreamStart(req: Request, res: Response, next: NextFunction) {
    const result = StreamStartSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: "Invalid stream start payload", details: result.error.errors });
    }
    (req as any).streamStart = result.data;
    next();
}

/**
 * Express middleware to validate stream stop payloads.
 * Attaches validated data to req.streamStop.
 */
export function validateStreamStop(req: Request, res: Response, next: NextFunction) {
    const result = StreamStopSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: "Invalid stream stop payload", details: result.error.errors });
    }
    (req as any).streamStop = result.data;
    next();
}

// --- Jest-style Test Templates ---
// Place these in __tests__/streams.schema.test.ts or similar

/**
 * @jest-environment node
 */
import { describe, it, expect } from "@jest/globals";

describe("StreamStartSchema", () => {
    it("validates a correct payload", () => {
        const result = StreamStartSchema.safeParse({ title: "Test", category: "Music" });
        expect(result.success).toBe(true);
    });
    it("fails on missing title", () => {
        const result = StreamStartSchema.safeParse({ category: "Music" });
        expect(result.success).toBe(false);
        expect(result.error.errors[0].message).toMatch(/title is required/);
    });
    it("fails on empty category", () => {
        const result = StreamStartSchema.safeParse({ title: "Test", category: "" });
        expect(result.success).toBe(false);
        expect(result.error.errors[0].message).toMatch(/cannot be empty/);
    });
});

describe("StreamStopSchema", () => {
    it("validates a correct payload", () => {
        const result = StreamStopSchema.safeParse({ streamId: "abc123" });
        expect(result.success).toBe(true);
    });
    it("fails on missing streamId", () => {
        const result = StreamStopSchema.safeParse({});
        expect(result.success).toBe(false);
        expect(result.error.errors[0].message).toMatch(/streamId is required/);
    });
    it("fails on empty streamId", () => {
        const result = StreamStopSchema.safeParse({ streamId: "" });
        expect(result.success).toBe(false);
        expect(result.error.errors[0].message).toMatch(/cannot be empty/);
    });
});
