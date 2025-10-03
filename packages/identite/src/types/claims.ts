//

import { z } from "zod";

//

export const UserClaimsSchema = z.object({
  email_verified: z.boolean(),
  email: z.string(),
  family_name: z.string().optional(),
  given_name: z.string().optional(),
  job: z.string().optional(),
  phone_number_verified: z.boolean(),
  phone_number: z.string().optional(),
  sub: z.string(),
  uid: z.string(),
  updated_at: z.date(),
  usual_name: z.string().optional(),
});

export type UserClaims = z.output<typeof UserClaimsSchema>;
