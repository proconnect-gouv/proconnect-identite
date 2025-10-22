//

import { schema } from "#src/sql";
import type { PGlite } from "@electric-sql/pglite";

export async function migrate(pg: PGlite) {
  return pg.exec(schema);
}
