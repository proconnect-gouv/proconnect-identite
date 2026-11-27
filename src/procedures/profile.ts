import { users } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import {
  activityContextSchemas,
  procedure,
} from "@proconnect-gouv/proconnect.identite.runtime";
import { UserNotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import { UserInformationSchema } from "@proconnect-gouv/proconnect.identite/types";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

export const userInfoChanged = procedure
  .inputs(activityContextSchemas["user.info_changed"].shape.inputs)
  .private(UserInformationSchema.partial().extend({ user_id: z.number() }))
  .outcome(activityContextSchemas["user.info_changed"].shape.outcome)
  .mutation(async ({ private: { user_id, ...information }, tx }) => {
    const [previous] = await tx
      .select({
        family_name: users.family_name,
        given_name: users.given_name,
        job: users.job,
        phone_number: users.phone_number,
      })
      .from(users)
      .where(eq(users.id, user_id))
      .for("update");

    if (!previous) {
      return { kind: "user_not_found", user_id } as const;
    }

    const changed = UserInformationSchema.keyof().options.filter(
      (key) =>
        information[key] !== undefined && information[key] !== previous[key],
    );
    if (changed.length === 0) {
      return { kind: "info_unchanged", user_id } as const;
    }

    const next = { ...previous };
    for (const key of changed) next[key] = information[key] ?? null;

    await tx
      .update(users)
      .set({ ...next, updated_at: sql`now()` })
      .where(eq(users.id, user_id));

    const changedFields = UserInformationSchema.partial();
    return {
      journal: {
        outcome: {
          next: changedFields.parse(
            Object.fromEntries(changed.map((key) => [key, next[key]])),
          ),
          previous: changedFields.parse(
            Object.fromEntries(changed.map((key) => [key, previous[key]])),
          ),
        },
        targets: { user_id },
      },
      kind: "info_changed",
      next,
      previous,
    } as const;
  });

export const userPasswordChanged = procedure
  .inputs(activityContextSchemas["user.password_changed"].shape.inputs)
  .private(z.object({ encrypted_password: z.string(), user_id: z.number() }))
  .outcome(activityContextSchemas["user.password_changed"].shape.outcome)
  .mutation(
    async ({
      inputs: { source },
      private: { encrypted_password, user_id },
      tx,
    }) => {
      const [previous] = await tx
        .select({ email_verified: users.email_verified })
        .from(users)
        .where(eq(users.id, user_id))
        .for("update");

      if (!previous) {
        throw new UserNotFoundError(`user ${user_id} not found`);
      }

      await tx
        .update(users)
        .set({
          email_verified: source === "reset_password",
          email_verified_at: source === "reset_password" ? sql`now()` : null,
          encrypted_password,
          reset_password_sent_at:
            source === "reset_password" ? null : undefined,
          reset_password_token: source === "reset_password" ? null : undefined,
          updated_at: sql`now()`,
        })
        .where(eq(users.id, user_id));

      return {
        journal: { outcome: { previous }, targets: { user_id } },
        kind: "password_changed",
        previous,
      } as const;
    },
  );
