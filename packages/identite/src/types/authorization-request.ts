import { z } from "zod";

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
  updated_at: Date;
}
