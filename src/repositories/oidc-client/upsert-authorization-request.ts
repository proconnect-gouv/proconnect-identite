//

import { users_oidc_clients } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import type {
  AuthorizationRequest,
  AuthorizationRequestOutcome,
  BaseAuthorizationRequest,
} from "@proconnect-gouv/proconnect.identite/types";
import { sql } from "drizzle-orm";
import type { DatabaseContext } from "../database";
import { with_dates } from "../dates";

//

export function upsertAuthorizationRequestFactory({ db }: DatabaseContext) {
  return async function upsertAuthorizationRequest({
    user_id,
    oidc_client_id,
    organization_id,
    sp_name,
    user_ip_address,
    interaction_cid,
    outcome,
  }: BaseAuthorizationRequest): Promise<AuthorizationRequest> {
    const now = new Date().toISOString();

    const [row] = await db
      .insert(users_oidc_clients)
      .values({
        created_at: now,
        interaction_cid,
        oidc_client_id,
        organization_id,
        outcome,
        sp_name,
        updated_at: now,
        user_id,
        user_ip_address,
      })
      .onConflictDoUpdate({
        set: {
          organization_id: sql`excluded.organization_id`,
          outcome: sql`excluded.outcome`,
          updated_at: sql`excluded.updated_at`,
          user_id: sql`excluded.user_id`,
        },
        target: users_oidc_clients.interaction_cid,
        targetWhere: sql`${users_oidc_clients.interaction_cid} is not null`,
      })
      .returning();

    if (!row) {
      throw new Error("Authorization request not found");
    }

    return {
      ...with_dates(row),
      outcome: row.outcome as AuthorizationRequestOutcome | null,
    };
  };
}
