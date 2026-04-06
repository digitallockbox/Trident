import { EngineMetadata } from "../../trident-core-internal/types/engine.types";

getMetadata: (): EngineMetadata => ({
    id: DEngineConfig.id,
    name: DEngineConfig.name,
    version: DEngineConfig.version,
    active: DEngineConfig.active
})
};
