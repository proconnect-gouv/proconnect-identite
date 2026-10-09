//

import { UserSchema } from "@proconnect-gouv/proconnect.identite/types";
import type { Cookie } from "express-session";
import { isPlainObject } from "lodash-es";
import { z } from "zod";
import { FranceConnectOidcSessionSchema } from "./franceconnect";

//

export const AmrValueSchema = z.enum([
  // Standard values are described here https://datatracker.ietf.org/doc/html/rfc8176#section-2
  "hwk",
  "pwd",
  "pop",
  "mfa",
  // "email-link" is described as "mail" here https://docs.partenaires.franceconnect.gouv.fr/fs/fs-technique/fs-technique-amr/
  "email-link",
  // The following values are used in ProConnect Identité for internal usage
  "totp",
  "email-otp",
  "uv",
]);

export const UnauthenticatedSessionDataSchema = z.object({
  authForProconnectFederation: z.boolean().optional(),
  certificationDirigeantRequested: z.boolean().optional(),
  email: z.string().optional(),
  hasWebauthnConfigured: z.boolean().optional(),
  interactionId: z.string().optional(),
  loginHint: z.string().optional(),
  needsInclusionconnectWelcomePage: z.boolean().optional(),
  prompt: z
    .object({
      details: z.record(z.string(), z.unknown()),
      name: z.string(),
      reasons: z.array(z.string()),
    })
    .optional(),
  referrerPath: z.string().optional(),
  siretHint: z.string().optional(),
  spName: z.string().optional(),
});

export const SessionDataSchema = z.object({
  ...UnauthenticatedSessionDataSchema.shape,
  ...FranceConnectOidcSessionSchema.partial().shape,
  amr: z.array(AmrValueSchema).optional(),
  pendingCertificationDirigeantOrganizationId: z.number().optional(),
  pendingGreetingsForSelectedOrganization: z.boolean().optional(),
  pendingModerationOrganizationId: z.number().optional(),
  pendingOfficialContactEmailVerificationOrganizationId: z.number().optional(),
  temporaryEncryptedTotpKey: z.string().optional(),
  user: UserSchema.optional(),
});

export const StoredSessionSchema = SessionDataSchema.extend({
  cookie: z.custom<Cookie>(isPlainObject),
}).loose();
