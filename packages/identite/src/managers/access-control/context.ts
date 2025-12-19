export type AccessContext = {
  uses_auth_headers: boolean;
  is_user_connected?: boolean;
  is_email_verified?: boolean;
  needs_email_verification_renewal?: boolean;
};
