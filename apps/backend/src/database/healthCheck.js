import pool from "./client.js";

export async function checkDatabaseConnection() {
  const result = await pool.query("SELECT 1 as ready");

  return result.rows[0];
}

export async function getDatabaseHealthStatus() {
  try {
    await checkDatabaseConnection();

    return {
      status: "ok",
      name: "postgres",
    };
  } catch (error) {
    return {
      status: "error",
      name: "postgres",
      message: error.message,
    };
  }
}