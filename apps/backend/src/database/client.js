import pg from "pg";
import databaseConfig from "./config.js";

const { Pool } = pg;

const pool = new Pool(databaseConfig);

export async function withTransaction(callback) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export async function closeDatabaseConnection() {
  await pool.end();
}

export default pool;