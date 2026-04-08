import { Router } from "express";
import { healthController } from "../api/health/health.controller";

export const apiRoutes = Router();

apiRoutes.get("/health", healthController.status);
<<<<<<< HEAD
=======


>>>>>>> 4d8821e2a9cc80fe6f171855a2b2d1af9056e788
