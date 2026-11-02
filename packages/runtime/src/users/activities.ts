//

import * as z from "zod";

//

const userInformation = z.object({
  family_name: z.string().nullable(),
  given_name: z.string().nullable(),
  job: z.string().nullable(),
  phone_number: z.string().nullable(),
});

export const userActivities = {
  "user.deleted": z.object({
    inputs: z.object({
      user_id: z.number(),
    }),
    outcome: z.object({
      email: z.string(),
      family_name: z.string().nullable(),
      given_name: z.string().nullable(),
      memberships: z.array(
        z.object({
          is_external: z.boolean(),
          organization_id: z.number(),
          verification_type: z.string(),
        }),
      ),
    }),
  }),
  "user.info_changed": z.object({
    inputs: userInformation,
    outcome: z.object({
      previous: userInformation,
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
  "user.totp_removed": z.object({
    inputs: z.object({}),
    outcome: z.object({
      force_2fa_cleared: z.boolean(),
      previous: z.object({ force_2fa: z.boolean() }),
    }),
  }),
};
