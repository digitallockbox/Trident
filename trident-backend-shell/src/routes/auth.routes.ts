import { Router } from "express";
import { authController } from "../auth/auth.controller";

export const authRoutes = Router();

authRoutes.post("/login", authController.login);
authRoutes.post("/logout", authController.logout);
authRoutes.get("/session", authController.session);
