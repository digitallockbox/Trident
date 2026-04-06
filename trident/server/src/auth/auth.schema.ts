import { z } from "zod";

export const RegisterSchema = z.object({
    email: z.string({ required_error: "email is required" }).email("Invalid email address"),
    password: z.string({ required_error: "password is required" }).min(8, "Password must be at least 8 characters"),
    tenant: z.string({ required_error: "tenant is required" }).min(1, "tenant cannot be empty")
});

export const LoginSchema = z.object({
    email: z.string({ required_error: "email is required" }).email("Invalid email address"),
    password: z.string({ required_error: "password is required" }),
    tenant: z.string({ required_error: "tenant is required" }).min(1, "tenant cannot be empty")
});

export const RefreshSchema = z.object({
    refreshToken: z.string({ required_error: "refreshToken is required" })
});
