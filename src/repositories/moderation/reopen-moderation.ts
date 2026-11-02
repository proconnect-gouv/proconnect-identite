//

import { moderations } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { ModerationStatusSchema } from "@proconnect-gouv/proconnect.identite/types";
import { eq, sql } from "drizzle-orm";
import type { DatabaseContext } from "../database";
import { with_dates } from "../dates";

//

export function reopenModerationFactory({ db }: DatabaseContext) {
  return async function reopenModeration({
    id,
    userEmail,
    cause,
  }: {
    id: number;
    userEmail: string;
    cause: string;
  }) {
    const [row] = await db
      .update(moderations)
      .set({
        comment: sql`COALESCE(${moderations.comment}, '') || ' | Réouvert le ' || CURRENT_DATE || ' par ' || ${userEmail} || ' - ' || ${cause}`,
        moderated_at: null,
        moderated_by: null,
        status: ModerationStatusSchema.enum.reopened,
      })
      .where(eq(moderations.id, id))
      .returning();

    return row && with_dates(row);
  };
}
