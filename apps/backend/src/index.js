import "dotenv/config";
import config from "./config/index.js";
import express from "express";
import healthRouter from "./routes/health.js";

const app = express();
const PORT = config.port;
// Middleware
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Backend is working! 🚀");
});

app.use("/health", healthRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});