import { z } from "zod";

export const AuthorizationRequestLastHaltEnum = z.enum([
  "2fa_sign_in",
  "double_authentication_choice",
  "franceconnect",
  "inclusionconnect_welcome",
  "join_organization",
  "personal_information",
  "select_organization",
  "start_sign_in",
  "verify_email",
  "welcome",
]);

export type AuthorizationRequestLastHalt = z.output<
  typeof AuthorizationRequestLastHaltEnum
>;

export const AuthorizationRequestOutcomeEnum = z.enum(["succeeded"]);

export type AuthorizationRequestOutcome = z.output<
  typeof AuthorizationRequestOutcomeEnum
>;

export interface BaseAuthorizationRequest {
  user_id: number;
  oidc_client_id: number;
  organization_id: number | null;
  sp_name: string | null;
  user_ip_address: string | null;
  interaction_cid: string | null;
  outcome: AuthorizationRequestOutcome | null;
}

export interface AuthorizationRequest extends BaseAuthorizationRequest {
  id: number;
  created_at: Date;
  last_halt: AuthorizationRequestLastHalt | null;
  updated_at: Date;
}
