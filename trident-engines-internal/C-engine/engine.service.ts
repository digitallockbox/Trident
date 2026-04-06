import { CEngineConfig } from "./engine.config";

export const CEngineService = {
    getMetadata: () => ({
        id: CEngineConfig.id,
        name: CEngineConfig.name,
        version: CEngineConfig.version,
        active: CEngineConfig.active
    })
};
