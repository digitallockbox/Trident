import { EngineMetadata } from "../../trident-core-internal/types/engine.types";

getMetadata: (): EngineMetadata => ({
    id: CEngineConfig.id,
    name: CEngineConfig.name,
    version: CEngineConfig.version,
    active: CEngineConfig.active
})
};
