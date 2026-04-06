import { EngineMetadata } from "../../trident-core-internal/types/engine.types";

getMetadata: (): EngineMetadata => ({
    id: BEngineConfig.id,
    name: BEngineConfig.name,
    version: BEngineConfig.version,
    active: BEngineConfig.active
})
};
