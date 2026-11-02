//

import { getEmailDomain } from "@proconnect-gouv/proconnect.core/services/email";
import { email_deliverability_whitelist } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { eq } from "drizzle-orm";
import type { DatabaseContext } from "../database";
import { with_dates } from "../dates";

//

export function findEmailInDeliverabilityWhiteListFactory({
  db,
}: DatabaseContext) {
  return async function findEmailInDeliverabilityWhiteList(email: string) {
    const domain = getEmailDomain(email);
    const [row] = await db
      .select()
      .from(email_deliverability_whitelist)
      .where(eq(email_deliverability_whitelist.email_domain, domain));

    return row && with_dates(row);
  };
}
