//

import { domainActivities } from "#src/domains";
import { membershipActivities } from "#src/memberships";
import type { ContextsOf } from "./types.js";

//

export const activityContextSchemas = {
  ...domainActivities,
  ...membershipActivities,
};

export type ActivityContexts = ContextsOf<typeof activityContextSchemas>;
