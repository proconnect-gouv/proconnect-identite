import { moderations } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import {
  activityContextSchemas,
  procedure,
} from "@proconnect-gouv/proconnect.identite.runtime";
import { ModerationStatusSchema } from "@proconnect-gouv/proconnect.identite/types";
import { and, eq, sql } from "drizzle-orm";
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

const reopened = activityContextSchemas["moderation.reopened"].shape;

export const moderationReopened = procedure
  .inputs(reopened.inputs)
  .private(
    z.object({
      cause_activity_id: z.number(),
      moderation_id: z.number(),
      user_email: z.string(),
      user_id: z.number(),
    }),
  )
  .outcome(reopened.outcome)
  .mutation(
    async ({
      inputs: { cause },
      private: { cause_activity_id, moderation_id, user_email, user_id },
      tx,
    }) => {
      const [moderation] = await tx
        .select({
          organization_id: moderations.organization_id,
          status: moderations.status,
        })
        .from(moderations)
        .where(
          and(
            eq(moderations.id, moderation_id),
            eq(moderations.user_id, user_id),
          ),
        )
        .for("update");

      if (moderation?.status !== ModerationStatusSchema.enum.rejected) {
        return { kind: "moderation_not_rejected" } as const;
      }

      await tx
        .update(moderations)
        .set({
          comment: sql`COALESCE(${moderations.comment}, '') || ' | Réouvert le ' || NOW()::date || ' par ' || ${user_email} || ' - ' || ${cause}`,
          moderated_at: null,
          moderated_by: null,
          status: ModerationStatusSchema.enum.reopened,
        })
        .where(eq(moderations.id, moderation_id));

      return {
        journal: {
          cause_activity_id,
          outcome: { previous: { status: moderation.status } },
          targets: {
            moderation_id,
            organization_id: moderation.organization_id,
            user_id,
          },
        },
        kind: "moderation_reopened",
      } as const;
    },
  );
