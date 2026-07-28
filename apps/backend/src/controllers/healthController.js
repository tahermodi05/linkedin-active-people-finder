import { getHealthStatus } from "../services/healthService.js";

export function getHealth(req, res) {
  const healthStatus = getHealthStatus();

  res.json(healthStatus);
}