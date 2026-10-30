//

import {
  email_domains,
  organizations,
  users,
  users_organizations,
} from "@proconnect-gouv/proconnect.identite.database/drizzle";
import type { IdentiteDatabase } from "@proconnect-gouv/proconnect.identite.runtime";
import { EmailDomainApprovedVerificationValues } from "@proconnect-gouv/proconnect.identite/types";
import { and, count, desc, eq, inArray, sql } from "drizzle-orm";
import { organizationColumns } from "./organization-columns";

//

export async function findOrganizationsByVerifiedEmailDomain(
  db: IdentiteDatabase,
  domain: string,
) {
  const member_count = count(users.id);

  return db
    .select({ ...organizationColumns, member_count })
    .from(organizations)
    .innerJoin(
      email_domains,
      eq(email_domains.organization_id, organizations.id),
    )
    .leftJoin(
      users_organizations,
      eq(users_organizations.organization_id, organizations.id),
    )
    .leftJoin(
      users,
      and(
        eq(users.id, users_organizations.user_id),
        sql`substring(${users.email} from '@(.+)$') = ${domain}`,
      ),
    )
    .where(
      and(
        eq(organizations.cached_est_active, true),
        eq(email_domains.domain, domain),
        inArray(
          email_domains.verification_type,
          EmailDomainApprovedVerificationValues,
        ),
      ),
    )
    .groupBy(organizations.id)
    .orderBy(desc(member_count));
}
