//

import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { $ } from "zx";

//

$.verbose = true;

//

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = relative(__dirname, join(__dirname, "..", ".."));

await $`docker compose down --volumes`;
await $`docker compose up db --wait`;
await $({ cwd: root })`npm run build:db:migrate`;
await $`docker compose exec -T db psql ${[
  "--username=proconnect-identite",
  '--command=DROP TABLE IF EXISTS "pgmigrations";',
]}`;

await $`docker compose exec -T db pg_dump ${[
  "--clean",
  "--if-exists",
  "--no-owner",
  "--no-privileges",
  "--quote-all-identifiers",
  "--schema-only",
  "--username=proconnect-identite",
]} > schema.sql`;

await $`drizzle-kit pull`;

await $`sed -i 's/unknown("credential_public_key")/bytea("credential_public_key")/g' src/drizzle/schema.ts`;
await $`echo ${'import { bytea } from "./orm/columes/bytea.js";'} >> src/drizzle/schema.ts`;
await $`sed -i "s/${"schema"}/${"schema.js"}/g" src/drizzle/relations.ts`;

await $`prettier --write src/drizzle/*.ts`;
await $`rm -rf src/drizzle/meta src/drizzle/*.sql`;

await $`docker compose down --volumes`;
