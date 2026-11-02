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
  "user.email_verified": z.object({
    inputs: z.object({}),
    outcome: z.object({
      previous: z.object({
        email_verified: z.boolean(),
      }),
    }),
  }),
  "user.force_2fa_disabled": z.object({
    inputs: z.object({}),
    outcome: z.object({
      previous: z.object({
        force_2fa: z.boolean(),
      }),
    }),
  }),
  "user.force_2fa_enabled": z.object({
    inputs: z.object({}),
    outcome: z.object({
      previous: z.object({
        force_2fa: z.boolean(),
      }),
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
  "user.passkey_added": z.object({
    inputs: z.object({
      display_name: z.string().nullable(),
    }),
    outcome: z.object({
      credential_id: z.string(),
    }),
  }),
  "user.passkey_removed": z.object({
    inputs: z.object({
      credential_id: z.string(),
    }),
    outcome: z.object({}),
  }),
  "user.password_changed": z.object({
    inputs: z.object({
      source: z.enum(["reset_password", "signup"]),
    }),
    outcome: z.object({
      previous: z.object({
        email_verified: z.boolean(),
        password_configured: z.boolean(),
      }),
    }),
  }),
  "user.recovery_words_regenerated": z.object({
    inputs: z.object({}),
    outcome: z.object({
      previous: z.object({
        recovery_words_configured: z.boolean(),
      }),
    }),
  }),
  "user.totp_added": z.object({
    inputs: z.object({}),
    outcome: z.object({
      previous: z.object({
        totp_configured: z.boolean(),
      }),
    }),
  }),
  "user.totp_removed": z.object({
    inputs: z.object({}),
    outcome: z.object({
      previous: z.object({
        totp_configured: z.boolean(),
      }),
    }),
  }),
};
