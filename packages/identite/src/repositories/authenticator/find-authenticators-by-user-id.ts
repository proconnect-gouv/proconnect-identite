//

import type { Authenticator, DatabaseContext } from "#src/types";
import { type QueryResult } from "pg";

//

export function findAuthenticatorsByUserIdFactory({ pg }: DatabaseContext) {
  return async function findAuthenticatorsByUserId(user_id: number) {
    const { rows }: QueryResult<Authenticator> = await pg.query(
      `
        SELECT *
        FROM authenticators
        WHERE user_id = $1
    `,
      [user_id],
    );

    return rows;
  };
}
