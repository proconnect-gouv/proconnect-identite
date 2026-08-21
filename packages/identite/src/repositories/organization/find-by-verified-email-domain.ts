//

import type { DatabaseContext } from "#src/types";
import {
  EmailDomainApprovedVerificationValues,
  type Organization,
} from "#src/types";
import { type QueryResult } from "pg";

//

export function findByVerifiedEmailDomainFactory({ pg }: DatabaseContext) {
  return async function findByVerifiedEmailDomain(email_domain: string) {
    const { rows }: QueryResult<Organization & { member_count: number }> =
      await pg.query(
        `
      SELECT o.*, count(u.id)::int as member_count
      FROM organizations o
             INNER JOIN email_domains ed ON ed.organization_id = o.id
             LEFT JOIN users_organizations uo ON uo.organization_id = o.id
             LEFT JOIN users u ON u.id = uo.user_id
        AND substring(u.email FROM '@(.+)$') = $1
      WHERE o.cached_est_active = 'true'
        AND ed.domain = $1
        AND ed.verification_type = ANY ($2)
      GROUP BY o.id
      ORDER BY member_count DESC NULLS LAST;`,
        [email_domain, EmailDomainApprovedVerificationValues],
      );

    return rows;
  };
}
