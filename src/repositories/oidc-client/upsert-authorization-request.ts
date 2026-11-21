//

import { users_oidc_clients } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import type { IdentiteDatabase } from "@proconnect-gouv/proconnect.identite.runtime";
import { sql } from "drizzle-orm";

//

export async function upsertAuthorizationRequest(
  db: IdentiteDatabase,
  values: Omit<
    typeof users_oidc_clients.$inferInsert,
    "created_at" | "id" | "updated_at"
  >,
) {
  await db
    .insert(users_oidc_clients)
    .values({ ...values, created_at: sql`now()`, updated_at: sql`now()` })
    .onConflictDoUpdate({
      set: {
        organization_id: sql`excluded.organization_id`,
        outcome: sql`excluded.outcome`,
        sid: sql`COALESCE(excluded.sid, ${users_oidc_clients.sid})`,
        updated_at: sql`now()`,
        user_id: sql`excluded.user_id`,
      },
      target: users_oidc_clients.interaction_cid,
      targetWhere: sql`interaction_cid IS NOT NULL`,
    });
}
