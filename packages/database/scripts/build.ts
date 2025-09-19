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
