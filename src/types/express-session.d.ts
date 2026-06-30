import type { PromptDetail } from "oidc-provider";
import type { CertificationSession } from "../managers/session/certification";
import type { FranceConnectOidcSession } from "../managers/session/franceconnect";

export interface UnauthenticatedSessionData {
  email?: string;
  loginHint?: string;
  siretHint?: string;
  needsInclusionconnectWelcomePage?: boolean;
  hasWebauthnConfigured?: boolean;
  interactionId?: string;
  mustReturnOneOrganizationInPayload?: boolean;
  prompt?: PromptDetail;
  referrerPath?: string;
  authForProconnectFederation?: boolean;
  certificationDirigeantRequested?: boolean;
  spName?: string;
}

export type AmrValue =
  // Standard values are described here https://datatracker.ietf.org/doc/html/rfc8176#section-2
  | "hwk"
  | "pwd"
  | "pop"
  | "mfa"
  // "email-link" is described as "mail" here https://docs.partenaires.franceconnect.gouv.fr/fs/fs-technique/fs-technique-amr/
  | "email-link"
  // The following values are used in ProConnect Identité for internal usage
  | "totp"
  | "email-otp"
  | "uv";

export interface AuthenticatedSessionData {
  user: User;
  amr: AmrValue[];
}

declare module "express-session" {
  export interface SessionData
    extends
      UnauthenticatedSessionData,
      Partial<FranceConnectOidcSession>,
      Partial<CertificationSession> {
    user?: User;
    temporaryEncryptedTotpKey?: string;
    amr?: AmrValue[];
    pendingModerationOrganizationId?: number;
    pendingCertificationDirigeantOrganizationId?: number;
  }
}
