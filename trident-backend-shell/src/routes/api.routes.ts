import { Router } from "express";
import { healthController } from "../api/health/health.controller";

export const apiRoutes = Router();

apiRoutes.get("/health", healthController.status);

export const apiRoutes = {
    health: "/api/health",
    system: "/api/system"
};
export const apiRoutes = {
    health: "/api/health",
    system: "/api/system"
};
