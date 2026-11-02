//

import { type Moderation } from "@proconnect-gouv/proconnect.identite/types";
import { type QueryResult } from "pg";
import type { DatabaseContext } from "../context";

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
