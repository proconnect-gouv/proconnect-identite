//

import {
  moderations,
  organizations,
} from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { ModerationTypeSchema } from "@proconnect-gouv/proconnect.identite/types";
import { and, eq, getTableColumns, isNull } from "drizzle-orm";
import type { DatabaseContext } from "../database";
import { to_organization } from "./to-organization.js";

//

export function findPendingByUserIdFactory({ db }: DatabaseContext) {
  return async function findPendingByUserId(user_id: number) {
    const rows = await db
      .select({
        ...getTableColumns(organizations),
        moderation_id: moderations.id,
      })
      .from(moderations)
      .innerJoin(
        organizations,
        eq(organizations.id, moderations.organization_id),
      )
      .where(
        and(
          eq(
            moderations.type,
            ModerationTypeSchema.enum.organization_join_block,
          ),
          eq(moderations.user_id, user_id),
          isNull(moderations.moderated_at),
        ),
      )
      .orderBy(moderations.created_at);

    return rows.map(to_organization);
  };
}
