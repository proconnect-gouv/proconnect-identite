//

import * as z from "zod";

//

export const moderationActivities = {
  "moderation.cancelled": z.object({
    inputs: z.object({}),
    outcome: z.object({
      previous: z.object({
        status: z.string(),
        type: z.string(),
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
  "moderation.reopened": z.object({
    inputs: z.object({
      cause: z.string(),
    }),
    outcome: z.object({
      previous: z.object({
        status: z.string(),
      }),
    }),
  }),
};
