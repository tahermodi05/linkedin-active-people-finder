function readEnv(name) {
  const value = process.env[name];

  return typeof value === "string" ? value.trim() : "";
}

function getDatabaseConfig() {
  const isProduction = process.env.NODE_ENV === "production";

  const host = readEnv("DB_HOST") || (isProduction ? "" : "localhost");
  const port = Number(readEnv("DB_PORT") || (isProduction ? "" : "5432"));
  const database = readEnv("DB_NAME") || (isProduction ? "" : "veriq");
  const user = readEnv("DB_USER") || (isProduction ? "" : "postgres");
  const password = readEnv("DB_PASSWORD") || (isProduction ? "" : "postgres");

  if (isProduction) {
    const missing = [
      ["DB_HOST", host],
      ["DB_NAME", database],
      ["DB_USER", user],
      ["DB_PASSWORD", password],
    ].filter(([, value]) => !value);

    if (missing.length > 0) {
      const missingNames = missing.map(([name]) => name).join(", ");
      throw new Error(
        `Missing required production database environment variables: ${missingNames}`
      );
    }
  }

  return {
    host,
    port,
    database,
    user,
    password,
    ssl: isProduction
      ? {
          rejectUnauthorized: false,
        }
      : false,
  };
}

const databaseConfig = getDatabaseConfig();

export default databaseConfig;