import pool from "./client.js";

export async function checkDatabaseConnection() {
  const result = await pool.query("SELECT 1");

  return result.rows[0];
}