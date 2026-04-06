import { SystemInfo } from "../../../trident-core-internal/types/system.types";

export const systemService = {
    getInfo: (): SystemInfo => ({
        name: "Trident Backend Shell",
        version: "0.0.1",
        environment: process.env.NODE_ENV || "development"
    }),

    getStatus: () => ({
        uptime: process.uptime(),
        timestamp: Date.now()
    })
};
