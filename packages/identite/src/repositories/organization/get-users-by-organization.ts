//

import type {
  BaseUserOrganizationLink,
  DatabaseContext,
  User,
} from "#src/types";
import type { QueryResult } from "pg";

//

export function getUsersByOrganizationFactory({ pg }: DatabaseContext) {
  return async function getUsersByOrganization(
    organization_id: number,
    additionalWhereClause: string = "",
    additionalParams: any[] = [],
  ) {
    const connection = pg;
    const baseParams = [organization_id];

    const { rows }: QueryResult<User & BaseUserOrganizationLink> =
      await connection.query(
        `
        SELECT
          u.*,
          uo.is_external,
          uo.verification_type,
          uo.has_been_greeted,
          uo.needs_official_contact_email_verification,
          uo.official_contact_email_verification_token,
          uo.official_contact_email_verification_sent_at
        FROM users u
        INNER JOIN users_organizations AS uo ON uo.user_id = u.id
        WHERE uo.organization_id = $1
        ${additionalWhereClause}`,
        [...baseParams, ...additionalParams],
      );

    return rows;
  };
}

export type GetUsersByOrganizationHandler = ReturnType<
  typeof getUsersByOrganizationFactory
>;
