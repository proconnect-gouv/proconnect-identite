//

import { UserInformationSchema } from "@proconnect-gouv/proconnect.identite/types";
import * as z from "zod";

//

const ChangedUserInformationSchema = UserInformationSchema.partial();

export const userActivities = {
  "user.force_2fa_disabled": z.object({
    inputs: z.object({
      reason: z.enum([
        "account_recovery",
        "passkey_removed",
        "totp_removed",
        "user_choice",
      ]),
    }),
    outcome: z.object({}),
  }),
  "user.force_2fa_enabled": z.object({
    inputs: z.object({}),
    outcome: z.object({}),
  }),
  "user.info_changed": z.object({
    inputs: z.object({}),
    outcome: z.object({
      next: ChangedUserInformationSchema,
      previous: ChangedUserInformationSchema,
    }),
  }),
  "user.mfa_reset": z.object({
    inputs: z.object({
      user_id: z.number(),
    }),
    outcome: z.object({
      previous: z.object({
        authenticators: z.number(),
        email_verified: z.boolean(),
        force_2fa: z.boolean(),
        password_configured: z.boolean(),
        totp_configured: z.boolean(),
      }),
    }),
  }),
  "user.password_changed": z.object({
    inputs: z.object({
      source: z.enum(["reset_password", "signup"]),
    }),
    outcome: z.object({
      previous: z.object({ email_verified: z.boolean() }),
    }),
  }),
};
