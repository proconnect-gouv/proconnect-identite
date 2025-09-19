//

import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

//

const schemaPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "schema.sql",
);

export const schema = await readFile(schemaPath, "utf-8");
