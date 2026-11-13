//

import { memberRemoved, memberUpdated } from "#src/memberships";
import { userDeleted } from "#src/users";

//

export const runtimeProcedures = {
  member: { removed: memberRemoved, updated: memberUpdated },
  user: { deleted: userDeleted },
};
