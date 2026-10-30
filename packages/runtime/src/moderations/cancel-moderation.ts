//

import type { ActivityContexts, RuntimeContext } from "#src/activity";
import { insertActivity } from "#src/journal";
import { moderations } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { ModerationStatusSchema } from "@proconnect-gouv/proconnect.identite/types";
import { eq, sql } from "drizzle-orm";

//

type CancelModerationOutcome =
  | {
      kind: "moderation_cancelled";
      activity_id: number;
      previous: ActivityContexts["moderation.cancelled"]["outcome"]["previous"];
    }
  | { kind: "moderation_not_found"; moderation_id: number }
  | { kind: "moderation_not_pending"; moderation_id: number };

export function cancelModerationFactory({ actor, app, db }: RuntimeContext) {
  return function cancelModeration({
    moderation_id,
  }: {
    moderation_id: number;
  }): Promise<CancelModerationOutcome> {
    return db.transaction(async (tx) => {
      const [moderation] = await tx
        .select({
          moderated_at: moderations.moderated_at,
          organization_id: moderations.organization_id,
          status: moderations.status,
          user_id: moderations.user_id,
        })
        .from(moderations)
        .where(eq(moderations.id, moderation_id))
        .for("update");

      if (!moderation) {
        return { kind: "moderation_not_found", moderation_id };
      }

      if (moderation.moderated_at !== null) {
        return { kind: "moderation_not_pending", moderation_id };
      }

      const previous = { status: moderation.status };

      await tx
        .update(moderations)
        .set({
          moderated_at: sql`now()`,
          status: ModerationStatusSchema.enum.cancelled,
        })
        .where(eq(moderations.id, moderation_id));

      const { activity_id } = await insertActivity<ActivityContexts>(tx, {
        action: "moderation.cancelled",
        actor,
        app,
        context: { inputs: { moderation_id }, outcome: { previous } },
        moderation_id,
        organization_id: moderation.organization_id,
        user_id: moderation.user_id,
      });

      return { kind: "moderation_cancelled", activity_id, previous };
    });
  };
}
