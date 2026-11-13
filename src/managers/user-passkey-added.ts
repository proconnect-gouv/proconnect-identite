import { authenticators } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import {
  activityContextSchemas,
  procedure,
} from "@proconnect-gouv/proconnect.identite.runtime";
import { z } from "zod";

const { inputs, outcome } = activityContextSchemas["user.passkey_added"].shape;

export const userPasskeyAdded = procedure
  .inputs(inputs)
  .private(
    z.object({
      authenticator: z.object({
        counter: z.number(),
        credential_backed_up: z.boolean(),
        credential_device_type: z.string(),
        credential_id: z.string(),
        credential_public_key: z.instanceof(Uint8Array),
        display_name: z.string().nullable(),
        last_used_at: z.string().nullable(),
        transports: z.array(z.string()).nullable(),
        usage_count: z.number(),
        user_verified: z.boolean(),
      }),
      user_id: z.number(),
    }),
  )
  .outcome(outcome)
  .mutation(async ({ private: { authenticator, user_id }, tx }) => {
    await tx.insert(authenticators).values({ ...authenticator, user_id });

    return {
      journal: { outcome: {}, targets: { user_id } },
      kind: "passkey_added",
    } as const;
  });
