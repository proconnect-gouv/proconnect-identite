//

import { official_contact_email_verifications } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import type {
  FindOfficialContactEmailVerification,
  OfficialContactEmailVerification,
} from "@proconnect-gouv/proconnect.identite/types";
import { and, eq } from "drizzle-orm";
import type { DatabaseContext } from "../database";
import { with_dates } from "../dates";

//

export function findOfficialContactEmailVerificationFactory({
  db,
}: DatabaseContext) {
  return async function findOfficialContactEmailVerification({
    organization_id,
    user_id,
  }: FindOfficialContactEmailVerification): Promise<
    OfficialContactEmailVerification | undefined
  > {
    const [row] = await db
      .select()
      .from(official_contact_email_verifications)
      .where(
        and(
          eq(
            official_contact_email_verifications.organization_id,
            organization_id,
          ),
          eq(official_contact_email_verifications.user_id, user_id),
        ),
      );

    if (!row) {
      return undefined;
    }

    return {
      ...with_dates(row),
      sent_at: row.sent_at ? new Date(row.sent_at) : null,
    };
  };
}
