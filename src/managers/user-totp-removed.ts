import { users } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import {
  activityContextSchemas,
  procedure,
} from "@proconnect-gouv/proconnect.identite.runtime";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const { inputs, outcome } = activityContextSchemas["user.totp_removed"].shape;

export const userTotpRemoved = procedure
  .inputs(inputs)
  .private(z.object({ user_id: z.number() }))
  .outcome(outcome)
  .mutation(async ({ private: { user_id }, tx }) => {
    const [user] = await tx
      .update(users)
      .set({
        encrypted_totp_key: null,
        totp_key_verified_at: null,
        updated_at: sql`now()`,
      })
      .where(eq(users.id, user_id))
      .returning();

    return {
      journal: { outcome: {}, targets: { user_id } },
      kind: "totp_removed",
      user,
    } as const;
  });
