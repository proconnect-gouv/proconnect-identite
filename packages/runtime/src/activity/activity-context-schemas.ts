//

import { domainActivities } from "#src/domains";
import { franceconnectActivities } from "#src/franceconnect";
import { membershipActivities } from "#src/memberships";
import type { ContextsOf } from "./types.js";

//

export const activityContextSchemas = {
  ...domainActivities,
  ...franceconnectActivities,
  ...membershipActivities,
};

export type ActivityContexts = ContextsOf<typeof activityContextSchemas>;
