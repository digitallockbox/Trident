import { z } from "zod";

export const PayoutRequestSchema = z.object({
    amountLamports: z
        .number({
            required_error: "amountLamports is required",
            invalid_type_error: "amountLamports must be a number"
        })
        .int("amountLamports must be an integer")
        .positive("amountLamports must be greater than zero")
});
