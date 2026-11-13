//

import * as z from "zod";

//

export const organizationActivities = {
  "organization.upserted": z.object({
    inputs: z.object({ siret: z.string() }),
    outcome: z.object({ created: z.boolean() }),
  }),
};
