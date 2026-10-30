//

import * as z from "zod";

//

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
};
