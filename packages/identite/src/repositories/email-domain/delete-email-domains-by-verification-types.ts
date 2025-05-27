//

import type { DatabaseContext, EmailDomain } from "#src/types";

//

export function deleteEmailDomainsByVerificationTypesFactory({
  pg,
}: DatabaseContext) {
  return async function deleteEmailDomainsByVerificationTypes({
    organization_id,
    domain,
    domain_verification_types,
  }: {
    organization_id: EmailDomain["organization_id"];
    domain_verification_types: EmailDomain["verification_type"][];
    domain: EmailDomain["domain"];
  }) {
    const connection = pg;
    const SQL_VERIFICATION_TYPES = domain_verification_types.map((type) =>
      type === null ? "NULL" : `'${type}'`,
    );

    const { rows } = await connection.query(
      `
      DELETE FROM email_domains
      WHERE
        organization_id = $1
        AND domain = $2
        AND verification_type IN (${SQL_VERIFICATION_TYPES.join(",")});`,
      [organization_id, domain],
    );
    return rows.length;
  };
}

export type DeleteEmailDomainsByVerificationTypesHandler = ReturnType<
  typeof deleteEmailDomainsByVerificationTypesFactory
>;
