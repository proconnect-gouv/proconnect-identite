//

import type { DatabaseContext, User } from "#src/types";
import { type QueryResult } from "pg";

//

export function findActiveByEmailFactory({ pg }: DatabaseContext) {
  return async function findActiveByEmail(email: string) {
    const { rows }: QueryResult<User> = await pg.query(
      `
      SELECT *
      FROM users WHERE email = $1 AND deleted_at IS NULL
      `,
      [email],
    );

    return rows.shift();
  };
}

export type FindActiveByEmailHandler = ReturnType<
  typeof findActiveByEmailFactory
>;
