import { users } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import {
  activityContextSchemas,
  procedure,
} from "@proconnect-gouv/proconnect.identite.runtime";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const { inputs, outcome } = activityContextSchemas["user.email_verified"].shape;

export const userEmailVerified = procedure
  .inputs(inputs)
  .private(z.object({ email_verified: z.boolean(), user_id: z.number() }))
  .outcome(outcome)
  .mutation(
    async ({
      inputs: { source },
      private: { email_verified, user_id },
      tx,
    }) => {
      const tokensToClear =
        source === "verify_email"
          ? { verify_email_sent_at: null, verify_email_token: null }
          : { magic_link_sent_at: null, magic_link_token: null };

      const [user] = await tx
        .update(users)
        .set({
          email_verified: true,
          email_verified_at: sql`now()`,
          ...tokensToClear,
          updated_at: sql`now()`,
        })
        .where(eq(users.id, user_id))
        .returning();

      return {
        journal: {
          outcome: { previous: { email_verified } },
          targets: { user_id },
        },
        kind: "email_verified",
        user,
      } as const;
    },
  );
