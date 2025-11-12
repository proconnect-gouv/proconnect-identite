//

import { z } from "zod";

//

export const IdentityVectorSchema = z.object({
  birthcountry: z.string().nullable(),
  birthdate: z.date().nullable(),
  birthplace: z.string().nullable(),
  family_name: z.string().nullable(),
  gender: z.enum(["male", "female"]).nullable(),
  given_name: z.string().nullable(),
});

export type IdentityVector = z.output<typeof IdentityVectorSchema>;
