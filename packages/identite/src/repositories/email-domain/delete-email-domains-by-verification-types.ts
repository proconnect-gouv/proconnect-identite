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
    const SQL_VERIFICATION_TYPES = domain_verification_types
      .map((type) =>
        type === null
          ? "verification_type IS NULL"
          : `verification_type = '${type}'`,
      )
      .join(" OR ");

    return pg.query(
      `
      DELETE FROM email_domains
      WHERE
        ${[
          "organization_id = $1",
          "domain = $2",
          `(${SQL_VERIFICATION_TYPES})`,
        ].join(" AND ")}
      ;
      `,
      [organization_id, domain],
    );
  };
}

export type DeleteEmailDomainsByVerificationTypesHandler = ReturnType<
  typeof deleteEmailDomainsByVerificationTypesFactory
>;
