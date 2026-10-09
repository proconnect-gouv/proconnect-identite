//

import { z } from "zod";

//

export const UserSchema = z.object({
  created_at: z.date(),
  current_challenge: z.string().nullable(),
  email: z.string(),
  email_verified: z.boolean(),
  email_verified_at: z.date().nullable(),
  encrypted_password: z.string().nullable(),
  encrypted_totp_key: z.string().nullable(),
  family_name: z.string().nullable(),
  force_2fa: z.boolean(),
  given_name: z.string().nullable(),
  id: z.number(),
  job: z.string().nullable(),
  last_sign_in_at: z.date().nullable(),
  magic_link_sent_at: z.date().nullable(),
  magic_link_token: z.string().nullable(),
  needs_inclusionconnect_onboarding_help: z.boolean(),
  needs_inclusionconnect_welcome_page: z.boolean(),
  phone_number: z.string().nullable(),
  reset_password_sent_at: z.date().nullable(),
  reset_password_token: z.string().nullable(),
  sign_in_count: z.number(),
  totp_key_verified_at: z.date().nullable(),
  updated_at: z.date(),
  verify_email_sent_at: z.date().nullable(),
  verify_email_token: z.string().nullable(),
});

export type User = z.output<typeof UserSchema>;
