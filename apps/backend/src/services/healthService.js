import config from "../config/index.js";
import { getDatabaseHealthStatus } from "../database/healthCheck.js";

export function getHealthStatus() {
  const uptime = process.uptime();

  let status;

  if (uptime < 10) {
    status = "starting";
  } else {
    status = "ok";
  }

  return {
    status,
    uptime,
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  };
}

export async function getLivenessStatus() {
  return getHealthStatus();
}

export async function getReadinessStatus() {
  const healthStatus = getHealthStatus();
  const checks = {};

  if (config.persistence === "postgres") {
    checks.postgres = await getDatabaseHealthStatus();
  }

  const isReady = Object.values(checks).every((check) => check.status === "ok");

  return {
    ...healthStatus,
    status: isReady ? "ready" : "not_ready",
    checks,
  };
}