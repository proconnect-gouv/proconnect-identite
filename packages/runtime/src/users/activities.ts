//

import * as z from "zod";

//

export const userActivities = {
  "user.deleted": z.object({
    inputs: z.object({
      user_id: z.number(),
    }),
    outcome: z.object({
      email: z.string(),
      family_name: z.string().nullable(),
      given_name: z.string().nullable(),
      memberships: z.array(
        z.object({
          is_external: z.boolean(),
          organization_id: z.number(),
          verification_type: z.string(),
        }),
      ),
    }),
  }),
};
