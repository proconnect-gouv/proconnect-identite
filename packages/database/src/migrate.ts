//

import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function migrate(exec_fn: (query: string) => Promise<unknown[]>) {
  const schemaPath = join(__dirname, "..", "schema.sql");
  const schema = await readFile(schemaPath, "utf-8");

  return exec_fn(schema);
}
