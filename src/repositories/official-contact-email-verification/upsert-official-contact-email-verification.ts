//

import { official_contact_email_verifications } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import type {
  BaseOfficialContactEmailVerification,
  OfficialContactEmailVerification,
} from "@proconnect-gouv/proconnect.identite/types";
import { sql } from "drizzle-orm";
import type { DatabaseContext } from "../database";
import { with_dates } from "../dates";

//

export function upsertOfficialContactEmailVerificationFactory({
  db,
}: DatabaseContext) {
  return async function upsertOfficialContactEmailVerification({
    organization_id,
    user_id,
    token,
    sent_at,
  }: BaseOfficialContactEmailVerification): Promise<OfficialContactEmailVerification> {
    const [row] = await db
      .insert(official_contact_email_verifications)
      .values({
        organization_id,
        sent_at: sent_at?.toISOString() ?? null,
        token,
        user_id,
      })
      .onConflictDoUpdate({
        set: {
          organization_id: sql`excluded.organization_id`,
          sent_at: sql`excluded.sent_at`,
          token: sql`excluded.token`,
          updated_at: new Date().toISOString(),
          user_id: sql`excluded.user_id`,
        },
        target: [
          official_contact_email_verifications.organization_id,
          official_contact_email_verifications.user_id,
        ],
      })
      .returning();

    if (!row) {
      throw new Error("Official contact email verification not found");
    }

    return {
      ...with_dates(row),
      sent_at: row.sent_at ? new Date(row.sent_at) : null,
    };
  };
}
