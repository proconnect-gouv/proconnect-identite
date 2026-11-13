//

import { memberRemoved } from "#src/memberships";
import { userDeleted } from "#src/users";

//

export const runtimeProcedures = {
  member: { removed: memberRemoved },
  user: { deleted: userDeleted },
};
