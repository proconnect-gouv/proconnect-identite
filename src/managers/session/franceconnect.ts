//

import { z } from "zod";

//

export const FranceConnectOidcSessionSchema = z.object({
  nonce: z.string(),
  state: z.string(),
  //
  redirectTo: z.string(),
});

export type FranceConnectOidcSession = z.output<
  typeof FranceConnectOidcSessionSchema
>;
