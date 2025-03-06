//

import { z } from "zod";

//

/**
 * @see https://docs.partenaires.franceconnect.gouv.fr/fs/fs-technique/fs-technique-scope-fc/#liste-des-claims
 */
export const FranceConnectUserInfoResponseSchema = z.object({
  birthdate: z.coerce.date(),
  birthplace: z.string(),
  family_name: z.string(),
  gender: z.string(),
  given_name: z.string(),
  preferred_username: z.string().optional(),
  sub: z.string(),
});

export type FranceConnectUserInfoResponse = z.output<
  typeof FranceConnectUserInfoResponseSchema
>;

//

export const FranceConnectUserInfoSchema =
  FranceConnectUserInfoResponseSchema.merge(
    z.object({
      created_at: z.coerce.date(),
      updated_at: z.coerce.date(),
      user_id: z.number(),
    }),
  );
export type FranceConnectUserInfo = z.output<
  typeof FranceConnectUserInfoSchema
>;
