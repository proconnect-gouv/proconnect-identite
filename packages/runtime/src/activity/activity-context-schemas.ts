//

import { domainActivities } from "#src/domains";
import { franceconnectActivities } from "#src/franceconnect";
import { membershipActivities } from "#src/memberships";
import { moderationActivities } from "#src/moderations";
import { organizationActivities } from "#src/organizations";
import { userActivities } from "#src/users";
import type { ContextsOf } from "./types.js";

//

export const activityContextSchemas = {
  ...domainActivities,
  ...franceconnectActivities,
  ...membershipActivities,
  ...moderationActivities,
  ...organizationActivities,
  ...userActivities,
};

export type ActivityContexts = ContextsOf<typeof activityContextSchemas>;
