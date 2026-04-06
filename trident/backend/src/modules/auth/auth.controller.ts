import { Request, Response } from "express";
import { authService } from "./auth.service";

export async function login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    return res.json(result);
}
