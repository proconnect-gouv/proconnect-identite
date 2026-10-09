//

import type { DatabaseContext, OidcClient } from "#src/types";
import { type QueryResult } from "pg";

//

export function findByClientIdFactory({ pg }: DatabaseContext) {
  return async function findByClientId(client_id: string) {
    const { rows }: QueryResult<OidcClient> = await pg.query(
      `
SELECT
    *
FROM oidc_clients
WHERE client_id = $1
`,
      [client_id],
    );

    return rows.shift();
  };
}
