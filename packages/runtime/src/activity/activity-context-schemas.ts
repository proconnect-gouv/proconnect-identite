//

import { domainActivities } from "#src/domains";
import type { ContextsOf } from "./types.js";

//

export const activityContextSchemas = { ...domainActivities };

export type ActivityContexts = ContextsOf<typeof activityContextSchemas>;
