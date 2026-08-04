import "dotenv/config";
import express from "express";
import cors from "cors";

import config from "./config/index.js";
import { logger } from "./middleware/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";

import healthRouter from "./routes/health.js";
import searchRouter from "./routes/searchRoutes.js";
import dashboardRouter from "./routes/dashboardRoutes.js";
import { checkDatabaseConnection } from "./database/healthCheck.js";
import { closeDatabaseConnection } from "./database/client.js";

const app = express();
const PORT = config.port;

function logEvent(event, details = {}) {
  console.log(JSON.stringify({
    level: "info",
    event,
    ...details,
  }));
}

function logFailure(event, details = {}) {
  console.error(JSON.stringify({
    level: "error",
    event,
    ...details,
  }));
}

async function validateStartupConfiguration() {
  if (config.persistence !== "postgres") {
    return;
  }

  try {
    await checkDatabaseConnection();
  } catch (error) {
    throw new Error(`PostgreSQL startup validation failed: ${error.message}`);
  }
}

// CORS
app.use(
  cors({
    origin: config.corsOrigin,
    methods: config.corsMethods,
    allowedHeaders: config.corsAllowedHeaders,
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
app.use("/api/dashboard", dashboardRouter);

// Error handler MUST be last
app.use(errorHandler);

async function startServer() {
  try {
    await validateStartupConfiguration();

    const server = app.listen(PORT, () => {
      logEvent("server_start", {
        port: PORT,
        pid: process.pid,
        environment: process.env.NODE_ENV || "development",
      });
    });

    const shutdown = async (signal) => {
      logEvent("server_shutdown", {
        signal,
        pid: process.pid,
      });

      if (!server.listening) {
        await closeDatabaseConnection();
        process.exit(0);
        return;
      }

      server.close(async (error) => {
        if (error) {
          logFailure("server_shutdown_error", {
            message: error.message,
          });
          await closeDatabaseConnection();
          process.exit(1);
          return;
        }

        await closeDatabaseConnection();
        process.exit(0);
      });
    };

    process.once("SIGTERM", () => {
      shutdown("SIGTERM").catch((error) => {
        logFailure("server_shutdown_error", {
          message: error.message,
        });
        process.exit(1);
      });
    });

    process.once("SIGINT", () => {
      shutdown("SIGINT").catch((error) => {
        logFailure("server_shutdown_error", {
          message: error.message,
        });
        process.exit(1);
      });
    });
  } catch (error) {
    logFailure("server_start_failed", {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

await startServer();