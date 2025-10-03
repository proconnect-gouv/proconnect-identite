//

export interface User {
  created_at: Date;
  current_challenge: string | null;
  email_verified_at: Date | null;
  email_verified: boolean;
  email: string;
  encrypted_password: string | null;
  encrypted_totp_key: string | null;
  family_name: string | null;
  force_2fa: boolean;
  given_name: string | null;
  id: number;
  job: string | null;
  last_sign_in_at: Date | null;
  magic_link_sent_at: Date | null;
  magic_link_token: string | null;
  needs_inclusionconnect_onboarding_help: boolean;
  needs_inclusionconnect_welcome_page: boolean;
  phone_number: string | null;
  reset_password_sent_at: Date | null;
  reset_password_token: string | null;
  sign_in_count: number;
  totp_key_verified_at: Date | null;
  updated_at: Date;
  verify_email_sent_at: Date | null;
  verify_email_token: string | null;
}
