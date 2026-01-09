import type { QueryResult } from "pg";
import { getDatabaseConnection } from "../connectors/postgres";

export const findByClientId = async (client_id: string) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<OidcClient> = await connection.query(
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

export const addConnection = async ({
  user_id,
  oidc_client_id,
  organization_id,
  sp_name,
  user_ip_address,
}: BaseConnection) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<Connection> = await connection.query(
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
