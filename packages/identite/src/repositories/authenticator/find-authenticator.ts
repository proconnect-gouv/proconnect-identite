//

import type { Authenticator, DatabaseContext } from "#src/types";
import { type QueryResult } from "pg";

//

export function findAuthenticatorFactory({ pg }: DatabaseContext) {
  return async function findAuthenticator(
    user_id: number,
    serialized_credential_id: string,
  ) {
    const { rows }: QueryResult<Authenticator> = await pg.query(
      `
        SELECT *
        FROM authenticators
        WHERE user_id = $1
          and credential_id = $2
    `,
      [user_id, serialized_credential_id],
    );

    return rows.shift();
  };
}
