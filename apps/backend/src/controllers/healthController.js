import {
  getHealthStatus,
  getLivenessStatus,
  getReadinessStatus,
} from "../services/healthService.js";

export async function getHealth(req, res) {
  const healthStatus = getHealthStatus();

  res.json(healthStatus);
}

export async function getLiveness(req, res) {
  const healthStatus = await getLivenessStatus();

  res.json(healthStatus);
}

export async function getReadiness(req, res) {
  const readinessStatus = await getReadinessStatus();
  const statusCode = readinessStatus.status === "ready" ? 200 : 503;

  res.status(statusCode).json(readinessStatus);
}