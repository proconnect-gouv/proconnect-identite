//

import { hashToPostgresParams } from "@proconnect-gouv/proconnect.identite/services/postgres";
import type {
  EmailDomain,
  EmailDomainVerificationType,
} from "@proconnect-gouv/proconnect.identite/types";
import type { QueryResult } from "pg";
import type { DatabaseContext } from "../context";

//

export function addDomainFactory({ pg }: DatabaseContext) {
  return async function addDomain({
    organization_id,
    domain,
    verification_type,
  }: {
    organization_id: number;
    domain: string;
    verification_type: EmailDomainVerificationType;
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
