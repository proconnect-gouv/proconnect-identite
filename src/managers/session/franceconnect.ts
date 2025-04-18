//

import { z } from "zod";

//

export const FranceConnectOidcSessionSchema = z.object({
  nonce: z.string(),
  state: z.string(),
  //
  id_token_hint: z.string().optional(),
});

export type FranceConnectOidcSession = z.output<
  typeof FranceConnectOidcSessionSchema
>;
