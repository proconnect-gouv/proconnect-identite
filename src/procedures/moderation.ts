import { moderations } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import {
  activityContextSchemas,
  procedure,
} from "@proconnect-gouv/proconnect.identite.runtime";
import { ModerationStatusSchema } from "@proconnect-gouv/proconnect.identite/types";
import { eq } from "drizzle-orm";
import { z } from "zod";

const cancelled = activityContextSchemas["moderation.cancelled"].shape;

export const moderationCancelled = procedure
  .inputs(cancelled.inputs)
  .private(z.object({ moderation_id: z.number() }))
  .outcome(cancelled.outcome)
  .mutation(async ({ private: { moderation_id }, tx }) => {
    const [moderation] = await tx
      .delete(moderations)
      .where(eq(moderations.id, moderation_id))
      .returning({
        organization_id: moderations.organization_id,
        status: moderations.status,
        type: moderations.type,
        user_id: moderations.user_id,
      });

    if (!moderation) {
      return { kind: "moderation_not_found" } as const;
    }

    const { organization_id, status, type, user_id } = moderation;
    return {
      journal: {
        outcome: { previous: { status, type } },
        targets: { moderation_id, organization_id, user_id },
      },
      kind: "moderation_cancelled",
    } as const;
  });

const { inputs, outcome } = activityContextSchemas["moderation.opened"].shape;

export const moderationOpened = procedure
  .inputs(inputs)
  .private(
    z.object({
      organization_id: z.number(),
      ticket_id: z.string().nullable(),
      user_id: z.number(),
    }),
  )
  .outcome(outcome)
  .mutation(
    async ({
      inputs: { sp_name, type },
      private: { organization_id, ticket_id, user_id },
      tx,
    }) => {
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

      return {
        journal: {
          outcome: {},
          targets: { moderation_id: moderation.id, organization_id, user_id },
        },
        kind: "moderation_opened",
        moderation,
      } as const;
    },
  );
