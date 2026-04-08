import { Router } from "express";

const registry = {
  engines: [
    { id: "A-engine", name: "Engine A", version: "0.0.1", active: true, description: "Primary processing engine placeholder." },
    { id: "B-engine", name: "Engine B", version: "0.0.1", active: true, description: "Secondary processing engine placeholder." },
    { id: "C-engine", name: "Engine C", version: "0.0.1", active: true, description: "Analytics engine placeholder." },
    { id: "D-engine", name: "Engine D", version: "0.0.1", active: true, description: "Auxiliary engine placeholder." }
  ]
};

export const engineRoutes = Router();

engineRoutes.get("/", (req, res) => {
    res.json(registry.engines);
});

engineRoutes.get("/:id", (req, res) => {
    const engine = registry.engines.find(e => e.id === req.params.id);
    if (!engine) return res.status(404).json({ error: "Engine not found" });
    res.json(engine);
});
