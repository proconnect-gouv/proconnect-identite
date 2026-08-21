//

import type { DatabaseContext, UserOrganizationLink } from "#src/types";
import { type QueryResult } from "pg";

//

export function getUserOrganizationLinkFactory({ pg }: DatabaseContext) {
  return async function getUserOrganizationLink(
    organization_id: number,
    user_id: number,
  ) {
    const { rows }: QueryResult<UserOrganizationLink> = await pg.query(
      `
SELECT
  user_id,
  organization_id,
  is_external,
  created_at,
  updated_at,
  verification_type,
  verified_at,
  has_been_greeted,
  needs_official_contact_email_verification,
  official_contact_email_verification_token,
  official_contact_email_verification_sent_at
FROM users_organizations
WHERE organization_id = $1 AND user_id = $2`,
      [organization_id, user_id],
    );

    return rows.shift();
  };
}
