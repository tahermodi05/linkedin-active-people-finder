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