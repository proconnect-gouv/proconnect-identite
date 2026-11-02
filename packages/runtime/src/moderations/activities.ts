//

import * as z from "zod";

//

export const moderationActivities = {
  "moderation.cancelled": z.object({
    inputs: z.object({
      moderation_id: z.number(),
    }),
    outcome: z.object({
      previous: z.object({
        status: z.string(),
      }),
    }),
  }),
  "moderation.opened": z.object({
    inputs: z.object({
      sp_name: z.string().nullable(),
      type: z.string(),
    }),
    outcome: z.object({}),
  }),
};
