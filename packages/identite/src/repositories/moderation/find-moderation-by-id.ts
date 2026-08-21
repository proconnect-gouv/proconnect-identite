//

import { type DatabaseContext, type Moderation } from "#src/types";
import { type QueryResult } from "pg";

//

export function findModerationByIdFactory({ pg }: DatabaseContext) {
  return async function findModerationById(id: number) {
    const { rows }: QueryResult<Moderation> = await pg.query(
      `
  SELECT *
  FROM moderations
  WHERE id = $1;`,
      [id],
    );

    return rows.shift();
  };
}
