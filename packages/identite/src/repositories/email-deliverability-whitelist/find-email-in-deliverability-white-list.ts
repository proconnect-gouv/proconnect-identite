//

import { type DatabaseContext } from "#src/types";
import { getEmailDomain } from "@proconnect-gouv/proconnect.core/services/email";
import { type QueryResult } from "pg";

//

export function findEmailInDeliverabilityWhiteListFactory({
  pg,
}: DatabaseContext) {
  return async function findEmailInDeliverabilityWhiteList(email: string) {
    const domain = getEmailDomain(email);
    const { rows }: QueryResult<{}> = await pg.query(
      `
        SELECT *
        FROM email_deliverability_whitelist WHERE email_domain = $1
    `,
      [domain],
    );

    return rows.shift();
  };
}
