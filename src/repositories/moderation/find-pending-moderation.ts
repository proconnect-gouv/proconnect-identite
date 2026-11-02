//

import { moderations } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import type { ModerationType } from "@proconnect-gouv/proconnect.identite/types";
import { and, eq, isNull } from "drizzle-orm";
import type { DatabaseContext } from "../database";
import { with_dates } from "../dates";

//

export function findPendingModerationFactory({ db }: DatabaseContext) {
  return async function findPendingModeration({
    organization_id,
    type,
    user_id,
  }: {
    organization_id: number;
    type: ModerationType;
    user_id: number;
  }) {
    const [row] = await db
      .select()
      .from(moderations)
      .where(
        and(
          eq(moderations.organization_id, organization_id),
          eq(moderations.type, type),
          eq(moderations.user_id, user_id),
          isNull(moderations.moderated_at),
        ),
      );

    return row && with_dates(row);
  };
}
