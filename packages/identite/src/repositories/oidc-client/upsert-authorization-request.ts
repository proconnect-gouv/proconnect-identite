//

import type {
  AuthorizationRequest,
  BaseAuthorizationRequest,
  DatabaseContext,
} from "#src/types";
import { type QueryResult } from "pg";

//

export function upsertAuthorizationRequestFactory({ pg }: DatabaseContext) {
  return async function upsertAuthorizationRequest({
    user_id,
    oidc_client_id,
    organization_id,
    sp_name,
    user_ip_address,
    interaction_cid,
    outcome,
  }: BaseAuthorizationRequest) {
    const { rows }: QueryResult<AuthorizationRequest> = await pg.query(
      `
INSERT INTO users_oidc_clients
  (user_id, oidc_client_id, organization_id, sp_name, user_ip_address, created_at, updated_at, interaction_cid, outcome)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
ON CONFLICT (interaction_cid) WHERE interaction_cid IS NOT NULL
DO UPDATE SET
  organization_id = EXCLUDED.organization_id,
  outcome = EXCLUDED.outcome,
  updated_at = EXCLUDED.updated_at,
  user_id = EXCLUDED.user_id
RETURNING user_id, oidc_client_id, organization_id, sp_name, user_ip_address, created_at, updated_at, id, interaction_cid, outcome, last_halt;
`,
      [
        user_id,
        oidc_client_id,
        organization_id,
        sp_name,
        user_ip_address,
        new Date(),
        new Date(),
        interaction_cid,
        outcome,
      ],
    );

    return rows.shift()!;
  };
}
