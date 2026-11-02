//

import { email_domains } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import type {
  EmailDomain,
  EmailDomainVerificationType,
} from "@proconnect-gouv/proconnect.identite/types";
import { eq } from "drizzle-orm";
import type { DatabaseContext } from "../database";
import { with_dates } from "../dates";

//

export function findEmailDomainsByOrganizationIdFactory({
  db,
}: DatabaseContext) {
  return async function findEmailDomainsByOrganizationId(
    organization_id: number,
  ): Promise<EmailDomain[]> {
    const rows = await db
      .select()
      .from(email_domains)
      .where(eq(email_domains.organization_id, organization_id));

    return rows.map((row) => ({
      ...with_dates(row),
      verification_type: row.verification_type as EmailDomainVerificationType,
      verified_at: row.verified_at ? new Date(row.verified_at) : null,
    }));
  };
}
