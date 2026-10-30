//

import * as z from "zod";

//

export const moderationActivities = {
  "moderation.opened": z.object({
    inputs: z.object({
      sp_name: z.string().nullable(),
      type: z.string(),
    }),
    outcome: z.object({}),
  }),
};
