import Pg from "pg";
import { DATABASE_URL } from "../config/env";
import { logger } from "../services/log";

const { Pool } = Pg;
let pool: Pg.Pool | null = null;

const obfuscatedConnectionString = (DATABASE_URL || "").replace(
  /\/\/(.*)@/,
  "//****:****@",
);

export const getDatabaseConnection = () => {
  if (pool) {
    return pool;
  }

  pool = new Pool({ connectionString: DATABASE_URL });

  pool.on("connect", (_client) => {
    logger.debug(`Connected to database : ${obfuscatedConnectionString}`);
  });

  pool.on("remove", (_client) => {
    logger.debug(`Disconnected from database : ${obfuscatedConnectionString}`);
  });

  pool.on("error", (error, _client) => {
    logger.error(`Database error: ${error}`);
  });

  return pool;
};
