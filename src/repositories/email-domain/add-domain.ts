//

import { email_domains } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import type {
  EmailDomain,
  EmailDomainVerificationType,
} from "@proconnect-gouv/proconnect.identite/types";
import type { DatabaseContext } from "../database";
import { with_dates } from "../dates";

//

export function addDomainFactory({ db }: DatabaseContext) {
  return async function addDomain({
    organization_id,
    domain,
    verification_type,
  }: {
    organization_id: number;
    domain: string;
    verification_type: EmailDomainVerificationType;
  }): Promise<EmailDomain> {
    const now = new Date().toISOString();

    const [row] = await db
      .insert(email_domains)
      .values({
        can_be_suggested: true,
        created_at: now,
        domain,
        organization_id,
        updated_at: now,
        verification_type,
        verified_at: now,
      })
      .returning();

    if (!row) {
      throw new Error("Email domain not found");
    }

    return {
      ...with_dates(row),
      verification_type: row.verification_type as EmailDomainVerificationType,
      verified_at: row.verified_at ? new Date(row.verified_at) : null,
    };
  };
}
