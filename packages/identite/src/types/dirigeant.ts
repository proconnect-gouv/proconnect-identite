//

import { z } from "zod";

//

export const IdentityVectorSchema = z.object({
  birthdate: z.date().nullable(),
  birthplace: z.string().nullable(),
  family_name: z.string().nullable(),
  gender: z.string().nullable(),
  given_name: z.string().nullable(),
});
export type IdentityVector = z.output<typeof IdentityVectorSchema>;
