import { recovery_words } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import {
  activityContextSchemas,
  procedure,
} from "@proconnect-gouv/proconnect.identite.runtime";
import { eq } from "drizzle-orm";
import { z } from "zod";

const { inputs, outcome } =
  activityContextSchemas["user.recovery_words_regenerated"].shape;

export const userRecoveryWordsRegenerated = procedure
  .inputs(inputs)
  .private(
    z.object({
      hashed_words: z.string(),
      recovery_words_configured: z.boolean(),
      user_id: z.number(),
    }),
  )
  .outcome(outcome)
  .mutation(
    async ({
      private: { hashed_words, recovery_words_configured, user_id },
      tx,
    }) => {
      await tx
        .delete(recovery_words)
        .where(eq(recovery_words.user_id, user_id));

      await tx.insert(recovery_words).values({ user_id, hashed_words });

      return {
        journal: {
          outcome: { previous: { recovery_words_configured } },
          targets: { user_id },
        },
        kind: "recovery_words_regenerated",
      } as const;
    },
  );
