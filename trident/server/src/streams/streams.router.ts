import { Router } from "express";
import { validateStreamStart, validateStreamStop, startStream, stopStream, listStreams } from "../validation/streams.schema";

const router = Router();

// POST /streams/start
router.post("/start", validateStreamStart, async (req, res, next) => {
    try {
        const userId = req.user?.id; // Assumes auth middleware sets req.user
        const { title, category } = (req as any).streamStart;
        const stream = await startStream({ userId, title, category });
        res.json({ success: true, data: stream, error: null });
    } catch (err) {
        next(err);
    }
});

// POST /streams/stop
router.post("/stop", validateStreamStop, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { streamId } = (req as any).streamStop;
        const stream = await stopStream({ userId, streamId });
        res.json({ success: true, data: stream, error: null });
    } catch (err) {
        next(err);
    }
});

// GET /streams/list
router.get("/list", async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const streams = await listStreams(userId);
        res.json({ success: true, data: streams, error: null });
    } catch (err) {
        next(err);
    }
});

export default router;