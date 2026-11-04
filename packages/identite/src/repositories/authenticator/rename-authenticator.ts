//

import type { Authenticator, DatabaseContext } from "#src/types";
import { type QueryResult } from "pg";

//

export function renameAuthenticatorFactory({ pg }: DatabaseContext) {
  return async function renameAuthenticator(
    user_id: number,
    credential_id: string,
    display_name: string | null,
  ) {
    const { rows }: QueryResult<Authenticator> = await pg.query(
      `
        UPDATE authenticators
        SET display_name = $3
        WHERE user_id = $1
          AND credential_id = $2
        RETURNING *`,
      [user_id, credential_id, display_name],
    );

    return rows.shift();
  };
}
