//

import type {
  DatabaseContext,
  FindUserOrganizationLink,
  UserOrganizationLink,
} from "#src/types";
import { type QueryResult } from "pg";

//

export function findUserOrganizationFactory({ pg }: DatabaseContext) {
  return async function findUserOrganization({
    organization_id,
    user_id,
  }: FindUserOrganizationLink) {
    const { rows }: QueryResult<UserOrganizationLink> = await pg.query(
      `
        SELECT user_id,
               organization_id,
               is_external,
               created_at,
               updated_at,
               verification_type,
               verified_at,
               has_been_greeted
        FROM users_organizations
        WHERE organization_id = $1
          AND user_id = $2`,
      [organization_id, user_id],
    );

    return rows.shift();
  };
}
