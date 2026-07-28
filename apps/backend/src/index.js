import "dotenv/config";
import config from "./config/index.js";
import express from "express";
import { logger } from "./middleware/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import healthRouter from "./routes/health.js";

const app = express();
const PORT = config.port;

app.use(express.json());
app.use(logger);

app.get("/", (req, res) => {
  res.send("Backend is working! 🚀");
});

app.use("/health", healthRouter);

// Error handler MUST be last
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});