import { users } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import {
  activityContextSchemas,
  procedure,
} from "@proconnect-gouv/proconnect.identite.runtime";
import { UserNotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const { inputs, outcome } =
  activityContextSchemas["user.password_changed"].shape;

export const userPasswordChanged = procedure
  .inputs(inputs)
  .private(z.object({ encrypted_password: z.string(), user_id: z.number() }))
  .outcome(outcome)
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
