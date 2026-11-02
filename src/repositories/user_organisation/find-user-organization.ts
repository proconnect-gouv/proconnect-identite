//

import { users_organizations } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import type {
  FindUserOrganizationLink,
  LinkType,
} from "@proconnect-gouv/proconnect.identite/types";
import { and, eq } from "drizzle-orm";
import type { DatabaseContext } from "../database";
import { with_dates } from "../dates";

//

export function findUserOrganizationFactory({ db }: DatabaseContext) {
  return async function findUserOrganization({
    organization_id,
    user_id,
  }: FindUserOrganizationLink) {
    const [row] = await db
      .select({
        created_at: users_organizations.created_at,
        has_been_greeted: users_organizations.has_been_greeted,
        is_external: users_organizations.is_external,
        organization_id: users_organizations.organization_id,
        updated_at: users_organizations.updated_at,
        user_id: users_organizations.user_id,
        verification_type: users_organizations.verification_type,
        verified_at: users_organizations.verified_at,
      })
      .from(users_organizations)
      .where(
        and(
          eq(users_organizations.organization_id, organization_id),
          eq(users_organizations.user_id, user_id),
        ),
      )
      .limit(1);

    return (
      row && {
        ...with_dates(row),
        // the column is an unconstrained varchar; the app writes LinkEnum values
        verification_type: row.verification_type as LinkType,
      }
    );
  };
}
