//

import type { ActivityContexts, RuntimeContext } from "#src/activity";
import { insertActivity } from "#src/journal";
import { moderations } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import {
  ModerationStatusSchema,
  type ModerationType,
} from "@proconnect-gouv/proconnect.identite/types";

//

type OpenModerationOutcome = {
  kind: "moderation_opened";
  activity_id: number;
  moderation: { id: number };
};

export function openModerationFactory({ actor, app, db }: RuntimeContext) {
  return function openModeration({
    organization_id,
    sp_name = null,
    ticket_id,
    type,
    user_id,
  }: {
    organization_id: number;
    sp_name?: string | null;
    ticket_id: string | null;
    type: ModerationType;
    user_id: number;
  }): Promise<OpenModerationOutcome> {
    return db.transaction(async (tx) => {
      const [moderation] = await tx
        .insert(moderations)
        .values({
          organization_id,
          sp_name,
          status: ModerationStatusSchema.enum.pending,
          ticket_id,
          type,
          user_id,
        })
        .returning({ id: moderations.id });

      const { activity_id } = await insertActivity<ActivityContexts>(tx, {
        action: "moderation.opened",
        actor,
        app,
        context: { inputs: { sp_name, type }, outcome: {} },
        moderation_id: moderation.id,
        organization_id,
        user_id,
      });

      return { kind: "moderation_opened", activity_id, moderation };
    });
  };
}
