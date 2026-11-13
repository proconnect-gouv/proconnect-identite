import { users } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import {
  activityContextSchemas,
  procedure,
} from "@proconnect-gouv/proconnect.identite.runtime";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const { inputs, outcome } = activityContextSchemas["user.totp_added"].shape;

export const userTotpAdded = procedure
  .inputs(inputs)
  .private(
    z.object({
      encrypted_totp_key: z.string(),
      totp_configured: z.boolean(),
      user_id: z.number(),
    }),
  )
  .outcome(outcome)
  .mutation(
    async ({
      private: { encrypted_totp_key, totp_configured, user_id },
      tx,
    }) => {
      const [user] = await tx
        .update(users)
        .set({
          encrypted_totp_key,
          totp_key_verified_at: sql`now()`,
          updated_at: sql`now()`,
        })
        .where(eq(users.id, user_id))
        .returning();

      return {
        journal: {
          outcome: { previous: { totp_configured } },
          targets: { user_id },
        },
        kind: "totp_added",
        user,
      } as const;
    },
  );
