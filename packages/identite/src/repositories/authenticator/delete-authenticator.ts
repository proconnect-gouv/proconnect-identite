//

import type { DatabaseContext } from "#src/types";
import { type QueryResult } from "pg";

//

export function deleteAuthenticatorFactory({ pg }: DatabaseContext) {
  return async function deleteAuthenticator(
    user_id: number,
    credential_id: string,
  ) {
    const { rowCount, affectedRows } = (await pg.query(
      `
        DELETE FROM authenticators
        WHERE user_id = $1
          and credential_id = $2
        RETURNING *`,
      [user_id, credential_id],
    )) as QueryResult & { affectedRows?: number };

    return (affectedRows ?? rowCount ?? 0) > 0;
  };
}
