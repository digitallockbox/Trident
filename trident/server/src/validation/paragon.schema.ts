import { z } from 'zod';

// Paragon Execute Input Schema
export const paragonExecuteSchema = z.object({
    field1: z
        .string()
        .min(1, 'field1 is required')
        .max(100, 'field1 too long')
        .regex(/^[a-zA-Z0-9 _-]{1,100}$/, 'Invalid field1 format'),
    field2: z.number(), // Adjust as needed for your business logic
    // Add more fields as required
    nonce: z.string().min(1), // For replay protection
    timestamp: z.number().int(), // For replay protection
    signature: z.string().min(1), // Solana signature
    publicKey: z.string().min(1), // Solana public key
});

export type ParagonExecuteInput = z.infer<typeof paragonExecuteSchema>;
