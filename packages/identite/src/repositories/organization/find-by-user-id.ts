//

import type {
  BaseUserOrganizationLink,
  DatabaseContext,
  Organization,
} from "#src/types";
import type { QueryResult } from "pg";

//

export function findByUserIdFactory({ pg }: DatabaseContext) {
  return async function findByUserId(userId: number) {
    const { rows }: QueryResult<Organization & BaseUserOrganizationLink> =
      await pg.query(
        `
        SELECT
          o.*,
          uo.is_external,
          uo.verification_type,
          uo.verified_at,
          uo.has_been_greeted,
          uo.needs_official_contact_email_verification,
          uo.official_contact_email_verification_token,
          uo.official_contact_email_verification_sent_at
        FROM organizations o
        INNER JOIN users_organizations uo ON uo.organization_id = o.id
        WHERE uo.user_id = $1
        ORDER BY o.created_at
      `,
        [userId],
      );

    return rows;
  };
}

export type FindByUserIdHandler = ReturnType<typeof findByUserIdFactory>;
