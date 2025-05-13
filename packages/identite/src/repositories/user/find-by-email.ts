//

import type { DatabaseContext, User } from "#src/types";
import { type QueryResult } from "pg";

//

export function findByEmailFactory({ pg }: DatabaseContext) {
  return async function findByEmail(email: string) {
    const { rows }: QueryResult<User> = await pg.query(
      `
      SELECT *
      FROM users WHERE email = $1
      `,
      [email],
    );

    return rows.shift();
  };
}

export type FindByEmailHandler = ReturnType<typeof findByEmailFactory>;
