//

import { official_contact_email_verifications } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import type { FindOfficialContactEmailVerification } from "@proconnect-gouv/proconnect.identite/types";
import { and, eq } from "drizzle-orm";
import type { DatabaseContext } from "../database";

//

export function deleteOfficialContactEmailVerificationFactory({
  db,
}: DatabaseContext) {
  return async function deleteOfficialContactEmailVerification({
    user_id,
    organization_id,
  }: FindOfficialContactEmailVerification) {
    const rows = await db
      .delete(official_contact_email_verifications)
      .where(
        and(
          eq(
            official_contact_email_verifications.user_id,
            user_id,
          ),
          eq(
            official_contact_email_verifications.organization_id,
            organization_id,
          ),
        ),
      )
      .returning();

    return rows.length > 0;
  };
}
