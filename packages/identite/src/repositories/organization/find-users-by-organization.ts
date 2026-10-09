//

import type {
  BaseUserOrganizationLink,
  DatabaseContext,
  User,
} from "#src/types";
import type { QueryResult } from "pg";

//

export function findUsersByOrganizationFactory({ pg }: DatabaseContext) {
  return async function findUsersByOrganization(organization_id: number) {
    const { rows }: QueryResult<User & BaseUserOrganizationLink> =
      await pg.query(
        `
          SELECT u.*,
                 uo.is_external,
                 uo.verification_type,
                 uo.verified_at,
                 uo.has_been_greeted
          FROM users u
                 INNER JOIN users_organizations AS uo ON uo.user_id = u.id
          WHERE uo.organization_id = $1`,
        [organization_id],
      );

    return rows;
  };
}
