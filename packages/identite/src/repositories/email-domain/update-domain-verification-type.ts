//

import type { DatabaseContext, EmailDomain } from "#src/types";
import type { QueryResult } from "pg";

//

export function updateDomainVerificationTypeFactory({ pg }: DatabaseContext) {
  return async function updateDomainVerificationType({
    id,
    verification_type,
  }: {
    id: EmailDomain["id"];
    verification_type: EmailDomain["verification_type"];
  }) {
    const connection = pg;

    const { rows }: QueryResult<EmailDomain> = await connection.query(
      `
      UPDATE email_domains
      SET
       verification_type = $1
      WHERE
        id = $2
      RETURNING *;`,
      [verification_type, id],
    );

    return rows.shift()!;
  };
}

export type UpdateDomainVerificationTypeHandler = ReturnType<
  typeof updateDomainVerificationTypeFactory
>;
