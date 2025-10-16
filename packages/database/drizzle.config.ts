//

import type { Config } from "drizzle-kit";
import { env } from "node:process";

//

export default {
  dbCredentials: {
    url:
      env["DATABASE_URL"] ||
      "postgres://proconnect-identite:proconnect-identite@127.0.0.1:5432/proconnect-identite",
  },
  dialect: "postgresql",
  introspect: { casing: "preserve" },
  out: "src/drizzle",
  schema: "src/drizzle/schema.ts",
  strict: true,
  verbose: true,
} satisfies Config;
