// Micro-engines controller skeleton
import { Request, Response } from "express";
import * as EngineService from "../services/engine.service";

export const invokeEngine = async (req: Request, res: Response) => {
    const { engine, action, payload } = req.body;
    const result = await EngineService.invokeEngine({ engine, action, payload, userId: req.user?.id });
    res.status(200).json({ success: true, data: result });
};
