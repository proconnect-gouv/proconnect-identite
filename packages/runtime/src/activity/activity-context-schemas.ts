//

import { domainActivities } from "#src/domains";
import { franceconnectActivities } from "#src/franceconnect";
import { membershipActivities } from "#src/memberships";
import { moderationActivities } from "#src/moderations";
import { userActivities } from "#src/users";
import type { ContextsOf } from "./types.js";

//

export const activityContextSchemas = {
  ...domainActivities,
  ...franceconnectActivities,
  ...membershipActivities,
  ...moderationActivities,
  ...userActivities,
};

export type ActivityContexts = ContextsOf<typeof activityContextSchemas>;
