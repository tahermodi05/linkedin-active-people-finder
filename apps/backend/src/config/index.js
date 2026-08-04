function getPort() {
  const value = process.env.PORT?.trim();

  if (!value) {
    throw new Error("PORT environment variable is required.");
  }

  const port = Number(value);

  if (Number.isNaN(port)) {
    throw new Error("PORT environment variable must be a valid number.");
  }

  if (port < 1 || port > 65535) {
    throw new Error(
      "PORT environment variable must be between 1 and 65535."
    );
  }

  return port;
}

function parseList(value, fallback) {
  if (!value) {
    return fallback;
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const config = {
  port: getPort(),
  persistence: process.env.PERSISTENCE?.trim() || "postgres",
  corsOrigin: parseList(process.env.CORS_ORIGIN, [
    "http://localhost:4173",
    "http://127.0.0.1:4173",
  ]),
  corsMethods: parseList(process.env.CORS_METHODS, ["GET", "POST", "OPTIONS"]),
  corsAllowedHeaders: parseList(process.env.CORS_ALLOWED_HEADERS, [
    "Content-Type",
    "Authorization",
  ]),
};

export default config;