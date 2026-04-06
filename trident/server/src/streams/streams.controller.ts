import { Request, Response } from "express";
import * as StreamsService from "./streams.service";
import { validateStreamStart, validateStreamStop } from "../validation/streams.schema";

export const startStream = [
    validateStreamStart,
    async (req: Request, res: Response) => {
        const { title, category } = (req as any).streamStart;
        const stream = await StreamsService.startStream({ title, category, userId: req.user?.id });
        res.status(201).json({ success: true, data: stream });
    }
];

export const stopStream = [
    validateStreamStop,
    async (req: Request, res: Response) => {
        const { streamId } = (req as any).streamStop;
        const result = await StreamsService.stopStream({ streamId, userId: req.user?.id });
        res.status(200).json({ success: true, data: result });
    }
];

export const listStreams = async (req: Request, res: Response) => {
    const streams = await StreamsService.listStreams({ userId: req.user?.id });
    res.status(200).json({ success: true, data: streams });
};
