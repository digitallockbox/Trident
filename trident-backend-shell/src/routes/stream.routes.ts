import { Router } from "express";
import { createStream, goLive, endStream } from "../services/streamLifecycle";

import { executeOmegaEntry } from "../engines/omega.entry";

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const streamRoutes = Router();

// POST /streams/create
streamRoutes.post("/create", async (req, res) => {
    try {
        const { creatorId, title, category } = req.body;
        const result = await createStream({ creatorId, title, category });
        // Return only the stream object for test alignment
        res.json({ stream: result.stream });
    } catch (err) {
        res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
    }
});

// POST /streams/go-live
streamRoutes.post("/go-live", async (req, res) => {
    try {
        const { streamId } = req.body;
        const result = await goLive({ streamId });
        res.json({ stream: result.stream });
    } catch (err) {
        res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
    }
});

// POST /streams/end
streamRoutes.post("/end", async (req, res) => {
    try {
        const { streamId } = req.body;
        const result = await endStream({ streamId });
        res.json({ stream: result.stream });
    } catch (err) {
        res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
    }
});


// GET /streams/list
streamRoutes.get("/list", async (req, res) => {
    try {
        const streams = await prisma.stream.findMany({
            where: { status: { in: ["LIVE", "READY"] } },
            orderBy: { createdAt: "desc" },
        });
        res.json({ streams });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// POST /streams/omega
// Runs the Omega engine for a given stream (payload: { streamId, omegaPayload })
streamRoutes.post("/omega", async (req, res) => {
    try {
        const { streamId, omegaPayload } = req.body;
        if (!streamId || !omegaPayload) {
            return res.status(400).json({ error: "Missing streamId or omegaPayload" });
        }
        const result = await executeOmegaEntry(omegaPayload);
        res.json({ result });
    } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
});
