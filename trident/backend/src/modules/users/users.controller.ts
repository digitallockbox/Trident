import { Request, Response } from "express";
import { usersService } from "./users.service";

export async function getUsers(_req: Request, res: Response) {
    const users = await usersService.getAll();
    return res.json(users);
}
