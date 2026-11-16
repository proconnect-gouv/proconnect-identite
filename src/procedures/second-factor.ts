import { users } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import {
  activityContextSchemas,
  procedure,
} from "@proconnect-gouv/proconnect.identite.runtime";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

const disabled = activityContextSchemas["user.force_2fa_disabled"].shape;

export const userForce2faDisabled = procedure
  .inputs(disabled.inputs)
  .private(z.object({ user_id: z.number() }))
  .outcome(disabled.outcome)
  .mutation(async ({ private: { user_id }, tx }) => {
    const [user] = await tx
      .update(users)
      .set({ force_2fa: false, updated_at: sql`now()` })
      .where(and(eq(users.id, user_id), eq(users.force_2fa, true)))
      .returning();

    if (!user) return { kind: "force_2fa_unchanged" } as const;

    return {
      journal: { outcome: {}, targets: { user_id } },
      kind: "force_2fa_disabled",
      user,
    } as const;
  });

const enabled = activityContextSchemas["user.force_2fa_enabled"].shape;

export const userForce2faEnabled = procedure
  .inputs(enabled.inputs)
  .private(z.object({ user_id: z.number() }))
  .outcome(enabled.outcome)
  .mutation(async ({ private: { user_id }, tx }) => {
    const [user] = await tx
      .update(users)
      .set({ force_2fa: true, updated_at: sql`now()` })
      .where(and(eq(users.id, user_id), eq(users.force_2fa, false)))
      .returning();

    if (!user) return { kind: "force_2fa_unchanged" } as const;

    return {
      journal: { outcome: {}, targets: { user_id } },
      kind: "force_2fa_enabled",
      user,
    } as const;
  });
