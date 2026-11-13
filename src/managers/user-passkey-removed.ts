import { authenticators } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import {
  activityContextSchemas,
  procedure,
} from "@proconnect-gouv/proconnect.identite.runtime";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const { inputs, outcome } =
  activityContextSchemas["user.passkey_removed"].shape;

export const userPasskeyRemoved = procedure
  .inputs(inputs)
  .private(z.object({ user_id: z.number() }))
  .outcome(outcome)
  .mutation(async ({ inputs: { credential_id }, private: { user_id }, tx }) => {
    const deleted = await tx
      .delete(authenticators)
      .where(
        credential_id
          ? and(
              eq(authenticators.user_id, user_id),
              eq(authenticators.credential_id, credential_id),
            )
          : eq(authenticators.user_id, user_id),
      )
      .returning({ credential_id: authenticators.credential_id });

    if (deleted.length === 0) {
      return { kind: "passkey_not_found", user_id } as const;
    }

    return {
      journal: { outcome: { removed: deleted.length }, targets: { user_id } },
      kind: "passkey_removed",
    } as const;
  });
