import pg from "pg";
import databaseConfig from "./config.js";

const { Pool } = pg;

const pool = new Pool(databaseConfig);

export default pool;