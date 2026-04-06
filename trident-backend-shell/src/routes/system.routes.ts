import { Router } from "express";
import { systemController } from "../api/system/system.controller";

export const systemRoutes = Router();

systemRoutes.get("/info", systemController.info);
systemRoutes.get("/status", systemController.status);
