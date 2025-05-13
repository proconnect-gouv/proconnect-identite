//

import { hashToPostgresParams } from "#src/services";
import type { DatabaseContext, EmailDomain } from "#src/types";
import type { QueryResult } from "pg";

//

export function addDomainFactory({ pg }: DatabaseContext) {
  return async function addDomain({
    organization_id,
    domain,
    verification_type,
  }: {
    organization_id: number;
    domain: string;
    verification_type: EmailDomain["verification_type"];
  }) {
    const connection = pg;

    const emailDomain = {
      organization_id,
      domain,
      verification_type,
      can_be_suggested: true,
      verified_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    const { paramsString, valuesString, values } =
      hashToPostgresParams<EmailDomain>(emailDomain);

    const { rows }: QueryResult<EmailDomain> = await connection.query(
      `
      INSERT INTO email_domains
        ${paramsString}
      VALUES
        ${valuesString}
      RETURNING *;`,
      values,
    );

    return rows.shift()!;
  };
}

export type AddDomainHandler = ReturnType<typeof addDomainFactory>;
