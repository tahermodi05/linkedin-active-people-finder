function getPort() {
  const value = process.env.PORT;

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

const config = {
  port: getPort(),
  persistence: process.env.PERSISTENCE || "memory",
};

export default config;