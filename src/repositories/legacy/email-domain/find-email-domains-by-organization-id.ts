//

import type { EmailDomain } from "@proconnect-gouv/proconnect.identite/types";
import type { QueryResult } from "pg";
import type { DatabaseContext } from "../context";

//

export function findEmailDomainsByOrganizationIdFactory({
  pg,
}: DatabaseContext) {
  return async function findEmailDomainsByOrganizationId(
    organization_id: number,
  ) {
    const { rows }: QueryResult<EmailDomain> = await pg.query(
      `
      SELECT *
      FROM email_domains
      WHERE organization_id = $1`,
      [organization_id],
    );

    return rows;
  };
}

export type FindEmailDomainsByOrganizationIdHandler = ReturnType<
  typeof findEmailDomainsByOrganizationIdFactory
>;
