import { Router } from "express";
import { healthController } from "../api/health/health.controller";

import { streamRoutes } from "./stream.routes";

export const apiRoutes = Router();

apiRoutes.get("/health", healthController.status);

// Stream lifecycle endpoints
apiRoutes.use("/streams", streamRoutes);
<<<<<<< HEAD
=======


>>>>>>> 4d8821e2a9cc80fe6f171855a2b2d1af9056e788
