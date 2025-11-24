import { getEmailDomain } from "@proconnect-gouv/proconnect.core/services/email";
import type { QueryResult } from "pg";
import { getDatabaseConnection } from "../connectors/postgres";

export const findEmailInDeliverabilityWhiteList = async (email: string) => {
  const connection = getDatabaseConnection();

  const domain = getEmailDomain(email);
  const { rows }: QueryResult<{}> = await connection.query(
    `
        SELECT *
        FROM email_deliverability_whitelist WHERE email_domain = $1
    `,
    [domain],
  );

  return rows.shift();
};
