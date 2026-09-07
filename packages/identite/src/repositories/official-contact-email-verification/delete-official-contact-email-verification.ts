//

import type {
  DatabaseContext,
  FindOfficialContactEmailVerification,
} from "#src/types";
import type { QueryResult } from "pg";

//

export function deleteOfficialContactEmailVerificationFactory({
  pg,
}: DatabaseContext) {
  return async function deleteOfficialContactEmailVerification({
    user_id,
    organization_id,
  }: FindOfficialContactEmailVerification) {
    const { rowCount, affectedRows } = (await pg.query(
      `
        DELETE
        FROM official_contact_email_verifications
        WHERE user_id = $1
          AND organization_id = $2`,
      [user_id, organization_id],
    )) as QueryResult & { affectedRows?: number };

    return (affectedRows ?? rowCount ?? 0) > 0;
  };
}
