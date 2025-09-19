//

import type { Config } from "drizzle-kit";

//

export default {
  dbCredentials: {
    url: "postgres://proconnect-identite:proconnect-identite@127.0.0.1:5432/proconnect-identite",
  },
  dialect: "postgresql",
  introspect: { casing: "preserve" },
  out: "src/drizzle",
  schema: "dist/drizzle/index.js",
  strict: true,
  verbose: true,
} satisfies Config;
