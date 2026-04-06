import { Request, Response } from "express";
import * as AuthService from "./auth.service";
import { RegisterSchema, LoginSchema, RefreshSchema } from "./auth.schema";

export async function register(req: Request, res: Response) {
    const result = RegisterSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: "Invalid registration payload", details: result.error.errors });
    }
    const user = await AuthService.register(result.data);
    return res.status(201).json({ success: true, data: user });
}

export async function login(req: Request, res: Response) {
    const result = LoginSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: "Invalid login payload", details: result.error.errors });
    }
    const token = await AuthService.login(result.data);
    return res.status(200).json({ success: true, data: token });
}

export async function refresh(req: Request, res: Response) {
    const result = RefreshSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: "Invalid refresh payload", details: result.error.errors });
    }
    const token = await AuthService.refresh(result.data);
    return res.status(200).json({ success: true, data: token });
}
