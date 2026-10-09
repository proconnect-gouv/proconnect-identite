//

import { type DatabaseContext } from "#src/types";
import { type QueryResult } from "pg";

//

export function deleteModerationFactory({ pg }: DatabaseContext) {
  return async function deleteModeration(id: number) {
    const { rowCount, affectedRows } = (await pg.query(
      `
  DELETE FROM moderations
  WHERE id = $1;`,
      [id],
    )) as QueryResult & { affectedRows?: number };

    return (affectedRows ?? rowCount ?? 0) > 0;
  };
}
