//

import {
  organizations,
  users_organizations,
} from "@proconnect-gouv/proconnect.identite.database/drizzle";
import type { LinkType } from "@proconnect-gouv/proconnect.identite/types";
import { eq, getTableColumns } from "drizzle-orm";
import type { DatabaseContext } from "../database";
import { to_organization } from "./to-organization.js";

//

export function findByUserIdFactory({ db }: DatabaseContext) {
  return async function findByUserId(userId: number) {
    const rows = await db
      .select({
        ...getTableColumns(organizations),
        is_external: users_organizations.is_external,
        verification_type: users_organizations.verification_type,
        verified_at: users_organizations.verified_at,
        has_been_greeted: users_organizations.has_been_greeted,
      })
      .from(organizations)
      .innerJoin(
        users_organizations,
        eq(users_organizations.organization_id, organizations.id),
      )
      .where(eq(users_organizations.user_id, userId))
      .orderBy(organizations.created_at);

    return rows.map((row) => ({
      ...to_organization(row),
      // the column is an unconstrained varchar; the app writes LinkEnum values
      verification_type: row.verification_type as LinkType,
    }));
  };
}
