//

import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { $ } from "zx";

//

$.verbose = true;

//

const __dirname = dirname(fileURLToPath(import.meta.url));
const database_workspace = resolve(__dirname, "..");
const root = resolve(__dirname, "..", "..");

await $({ cwd: root })`docker compose down --volumes`;
await $({ cwd: root })`docker compose up db --wait`;
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
await $({ cwd: database_workspace })`prettier --write schema.sql`;

await $`drizzle-kit pull`;

{
  // Postgres bytea type is not supported by drizzle-orm
  // see https://github.com/drizzle-team/drizzle-orm/issues/3902
  //

  let file_content = await readFile(
    resolve(database_workspace, "src/drizzle/schema.ts"),
    "utf8",
  );

  // We import a local version of bytea here
  file_content += `\nimport { bytea } from "./orm/columes/bytea.js";`;

  // We replace the unknown type with bytea
  file_content = file_content.replaceAll(
    'unknown("credential_public_key")',
    'bytea("credential_public_key")',
  );
  await writeFile(
    resolve(database_workspace, "src/drizzle/schema.ts"),
    file_content,
  );
}

{
  // Our TSConfig `moduleresolution` is not compatible with drizzle-kit default output
  // We should replace `import { [...] } from "./schema";` by `import { [...] } from "./schema.js";`
  // see our common : packages/devtools/typescript/base/tsconfig.json
  // see https://www.typescriptlang.org/docs/handbook/modules/reference.html#the-moduleresolution-compiler-option
  let file_content = await readFile(
    resolve(database_workspace, "src/drizzle/relations.ts"),
    "utf8",
  );
  file_content = file_content.replaceAll("./schema", "./schema.js");
  await writeFile(
    resolve(database_workspace, "src/drizzle/relations.ts"),
    file_content,
  );
}

await $({ cwd: database_workspace })`prettier --write src/drizzle/*.ts`;
await $({ cwd: database_workspace })`rm -rf src/drizzle/meta src/drizzle/*.sql`;

await $({ cwd: root })`docker compose down --volumes`;
