//

import { execFile } from "child_process";
import { defineConfig } from "cypress";
import dotenvFlow from "dotenv-flow";
import { Client } from "pg";
import { createClient } from "redis";
import { promisify } from "util";

//

// Load the same `.env.<DEPLOY_ENV>` files as the app, so that the tasks below
// connect to the same database and redis (DATABASE_URL, REDIS_URL)
dotenvFlow.config({
  node_env: process.env["DEPLOY_ENV"] || "development",
  silent: true,
});
const RECORD = process.env["CYPRESS_RECORD"] === "true";

async function npm_run(args: string[], env?: NodeJS.ProcessEnv) {
  console.log(`$ npm run ${args.join(" ")}`);
  const { stdout } = await promisify(execFile)("npm", ["run", ...args], {
    env: { ...process.env, ...env },
  });
  console.log(stdout);
}

async function redis_delete(pattern: string) {
  const client = await createClient({
    url: process.env["REDIS_URL"],
  }).connect();
  try {
    let deleted = 0;
    for await (const keys of client.scanIterator({ MATCH: pattern })) {
      if (keys.length > 0) deleted += await client.del(keys);
    }
    return deleted;
  } finally {
    client.destroy();
  }
}

export default defineConfig({
  chromeWebSecurity: false,
  e2e: {
    baseUrl: "http://localhost:3000",
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      on("task", {
        async seed(scope: string) {
          await redis_delete("*");
          await npm_run(["delete-database"], {
            ENABLE_DATABASE_DELETION: "True",
          });
          await npm_run(["migrate", "up"]);
          await npm_run(["fixtures:load-ci", "--", `${scope}/fixtures.sql`]);
          await npm_run(["update-organization-info", "--", "0"]);
          return null;
        },
        redis_delete,
        log(message) {
          console.log(message);

          return null;
        },
        async psql(sql: string) {
          const client = new Client({
            connectionString: process.env["DATABASE_URL"],
          });
          await client.connect();
          try {
            const { rows } = await client.query(sql);
            return rows;
          } finally {
            await client.end();
          }
        },
      });
      return config;
    },
  },
  expose: {
    MAILDEV_PROTOCOL: "http",
    MAILDEV_HOST: "localhost",
    MAILDEV_SMTP_PORT: "1025",
    MAILDEV_API_PORT: "1080",
  },
  video: RECORD,
});
