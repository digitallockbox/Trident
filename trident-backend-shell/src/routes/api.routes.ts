import { Router } from "express";
import { healthController } from "../api/health/health.controller";

export const apiRoutes = Router();

apiRoutes.get("/health", healthController.status);
