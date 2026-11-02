//

import { moderations } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import {
  ModerationStatusSchema,
  type ModerationType,
} from "@proconnect-gouv/proconnect.identite/types";
import { and, eq, isNotNull } from "drizzle-orm";
import type { DatabaseContext } from "../database";
import { with_dates } from "../dates";

//

export function findRejectedModerationFactory({ db }: DatabaseContext) {
  return async function findRejectedModeration({
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
          isNotNull(moderations.moderated_at),
          eq(moderations.status, ModerationStatusSchema.enum.rejected),
        ),
      );

    return row && with_dates(row);
  };
}
