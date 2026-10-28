//

import { defineConfig } from "cypress";
import { Client } from "pg";

//
const RECORD = process.env["CYPRESS_RECORD"] === "true";

export default defineConfig({
  chromeWebSecurity: false,
  e2e: {
    baseUrl: "http://localhost:3000",
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      on("task", {
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
