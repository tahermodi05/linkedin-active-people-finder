import "dotenv/config";
import express from "express";
import cors from "cors";

import config from "./config/index.js";
import { logger } from "./middleware/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";

import healthRouter from "./routes/health.js";
import searchRouter from "./routes/searchRoutes.js";

const app = express();
const PORT = config.port;

// CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// Middleware
app.use(express.json());
app.use(logger);

// Routes
app.get("/", (req, res) => {
  res.send("Backend is working! 🚀");
});

app.use("/health", healthRouter);
app.use("/api/search", searchRouter);

// Error handler MUST be last
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

console.log(server.listening);
console.log(process.pid);

setInterval(() => {
  console.log("alive");
}, 5000);