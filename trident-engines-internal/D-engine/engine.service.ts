import { DEngineConfig } from "./engine.config";

export const DEngineService = {
    getMetadata: () => ({
        id: DEngineConfig.id,
        name: DEngineConfig.name,
        version: DEngineConfig.version,
        active: DEngineConfig.active
    })
};
