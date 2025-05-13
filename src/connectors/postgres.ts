import Pg from "pg";
import { DATABASE_URL } from "../config/env";
import { logger } from "../services/log";

const { Pool } = Pg;
let pool: Pg.Pool | null = null;

const obfuscatedConnectionString = (DATABASE_URL || "").replace(
  /\/\/(.*)@/,
  "//****:****@",
);

// This function is used in Hyyypertool to enable the manager function from ProConnect Identité.
// Hyyypertool imports ProConnect Identité and then updates the Database connection to use its own.
export const setDatabaseConnection = (newPool: Pg.Pool) => {
  pool = newPool;
};

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
