//

import type { DatabaseContext, User } from "#src/types";
import { type QueryResult } from "pg";

//

export function findActiveByIdFactory({ pg }: DatabaseContext) {
  return async function findActiveById(id: number) {
    const { rows }: QueryResult<User> = await pg.query(
      `
      SELECT *
      FROM users
      WHERE id = $1 AND deleted_at IS NULL
      `,
      [id],
    );

    return rows.shift();
  };
}

export type FindActiveByIdHandler = ReturnType<typeof findActiveByIdFactory>;
