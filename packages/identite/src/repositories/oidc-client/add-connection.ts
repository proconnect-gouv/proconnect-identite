//

import type { BaseConnection, Connection, DatabaseContext } from "#src/types";
import { type QueryResult } from "pg";

//

export function addConnectionFactory({ pg }: DatabaseContext) {
  return async function addConnection({
    user_id,
    oidc_client_id,
    organization_id,
    sp_name,
    user_ip_address,
  }: BaseConnection) {
    const { rows }: QueryResult<Connection> = await pg.query(
      `
INSERT INTO users_oidc_clients
  (user_id, oidc_client_id, organization_id, sp_name, user_ip_address, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING user_id, oidc_client_id, organization_id, sp_name, user_ip_address, created_at, updated_at, id;
`,
      [
        user_id,
        oidc_client_id,
        organization_id,
        sp_name,
        user_ip_address,
        new Date(),
        new Date(),
      ],
    );

    return rows.shift()!;
  };
}
