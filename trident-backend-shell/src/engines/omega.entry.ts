import { Router } from 'express';
import { EngineMetadata } from '../trident-core-internal/types/engine';
import registry from '../trident-engines-internal/registry.json';

export const engineRoutes = Router();

// GET all engines
engineRoutes.get('/', (req, res) => {
    const engines: EngineMetadata[] = registry.engines;
    res.json(engines);
});

// GET engine by ID
engineRoutes.get('/:id', (req, res) => {
    const engine = registry.engines.find(e => e.id === req.params.id);

    if (!engine) {
        return res.status(404).json({ error: 'Engine not found' });
    }

    res.json(engine);
});
