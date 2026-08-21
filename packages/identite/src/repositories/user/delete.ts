//

import type { DatabaseContext } from "#src/types";
import { type QueryResult } from "pg";

//

export function deleteUserFactory({ pg }: DatabaseContext) {
  return async function deleteUser(id: number) {
    const { rowCount, affectedRows } = (await pg.query(
      `
DELETE FROM users
WHERE id = $1`,
      [id],
    )) as QueryResult & { affectedRows?: number };

    return (affectedRows ?? rowCount ?? 0) > 0;
  };
}
