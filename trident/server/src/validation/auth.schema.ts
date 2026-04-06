import { z } from "zod";

export const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    tenant: z.string(),
});

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    tenant: z.string(),
});

export const RefreshSchema = z.object({
    refreshToken: z.string(),
});
