import { Router } from "express";
import registry from "../../../trident-engines-internal/engine-registry.json";

export const engineRoutes = Router();

engineRoutes.get("/", (req, res) => {
    res.json(registry.engines);
});

engineRoutes.get("/:id", (req, res) => {
    const engine = registry.engines.find(e => e.id === req.params.id);
    if (!engine) return res.status(404).json({ error: "Engine not found" });
    res.json(engine);
});
