//

import type {
  DatabaseContext,
  FindOfficialContactEmailVerification,
  OfficialContactEmailVerification,
} from "#src/types";
import { type QueryResult } from "pg";

//

export function findOfficialContactEmailVerificationFactory({
  pg,
}: DatabaseContext) {
  return async function findOfficialContactEmailVerification({
    organization_id,
    user_id,
  }: FindOfficialContactEmailVerification) {
    const { rows }: QueryResult<OfficialContactEmailVerification> =
      await pg.query(
        `
          SELECT *
          FROM official_contact_email_verifications
          WHERE organization_id = $1
            AND user_id = $2;`,
        [organization_id, user_id],
      );

    return rows.shift();
  };
}
