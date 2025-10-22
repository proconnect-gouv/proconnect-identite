//

import { schema } from "#src/sql";
import type { ClientBase } from "pg";

export async function migrate(pg: ClientBase) {
  return pg.query(schema);
}
