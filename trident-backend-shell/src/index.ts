import express from "express";
import cors from "cors";
import { authRoutes } from "./routes/auth.routes";
import { systemRoutes } from "./routes/system.routes";
import { requestLogger } from "./middleware/request-logger";
import { errorHandler } from "./middleware/error-handler";
import { apiRoutes } from "./routes/api.routes";


import { apiRoutes } from "./routes/api.routes";
import { engineRoutes } from "./routes/engine.routes";


const app = express();
app.disable('x-powered-by');
app.use(express.json());
app.use(cors());
app.use(requestLogger);

app.use("/api", apiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/system", systemRoutes);

app.use("/api/engines", engineRoutes);

// TRIDENT OS — DEVELOPER TESTING PROTOCOL (MOCKS)
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.all("/engine/omega", (req, res) => res.json({ engine: "omega", status: "mock" }));
app.all("/engine/aegis", (req, res) => res.json({ engine: "aegis", status: "mock" }));
app.all("/engine/overwatch", (req, res) => res.json({ engine: "overwatch", status: "mock" }));

app.all("/stream/start", (req, res) => res.json({ stream: "started", action: "start", status: "mock" }));
app.all("/stream/stop", (req, res) => res.json({ stream: "stopped", action: "stop", status: "mock" }));
app.all("/stream/status", (req, res) => res.json({ stream: "active", uptime: 120, status: "mock" }));
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Trident Backend Shell running on port ${PORT}`);
});

export const bootstrap = () => {
    console.log("Trident Backend Shell initialized");
};
bootstrap();
