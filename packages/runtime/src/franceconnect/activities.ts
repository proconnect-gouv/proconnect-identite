//

import * as z from "zod";

//

export const franceconnectActivities = {
  "franceconnect.connected": z.object({
    inputs: z.object({}),
    outcome: z.object({
      connected_at: z.string(),
    }),
  }),
  "franceconnect.disconnected": z.object({
    inputs: z.object({}),
    outcome: z.object({
      connected_at: z.string(),
    }),
  }),
};
