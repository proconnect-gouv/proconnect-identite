//

import { z } from "zod";

//

export const CertificationSessionSchema = z.object({
  certificationDirigeantRequested: z.boolean().default(false),
  // isUserCertified: z.boolean().default(false),
});
export type CertificationSession = z.infer<typeof CertificationSessionSchema>;

//

export const FranceConnectOidcSessionSchema = z.object({
  nonce: z.string(),
  state: z.string(),
});

export type FranceConnectOidcSession = z.infer<
  typeof FranceConnectOidcSessionSchema
>;
