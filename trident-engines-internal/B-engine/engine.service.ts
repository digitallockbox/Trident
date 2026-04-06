import { BEngineConfig } from "./engine.config";

export const BEngineService = {
    getMetadata: () => ({
        id: BEngineConfig.id,
        name: BEngineConfig.name,
        version: BEngineConfig.version,
        active: BEngineConfig.active
    })
};
