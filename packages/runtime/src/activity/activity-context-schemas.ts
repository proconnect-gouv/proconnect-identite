//

import { domainActivities } from "#src/domains";
import { franceconnectActivities } from "#src/franceconnect";
import { membershipActivities } from "#src/memberships";
import { moderationActivities } from "#src/moderations";
import { contextSchemasOf, mergeContextSchemas } from "#src/procedure";
import { runtimeProcedures } from "#src/procedures";
import { userActivities } from "#src/users";
import type { ContextsOf } from "./types.js";

//

export const activityContextSchemas = mergeContextSchemas(
  {
    ...domainActivities,
    ...franceconnectActivities,
    ...membershipActivities,
    ...moderationActivities,
    ...userActivities,
  },
  contextSchemasOf(runtimeProcedures),
);

export type ActivityContexts = ContextsOf<typeof activityContextSchemas>;
