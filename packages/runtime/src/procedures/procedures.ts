//

import { franceconnectDisconnected } from "#src/franceconnect";
import { memberRemoved, memberUpdated } from "#src/memberships";
import { userDeleted } from "#src/users";

//

export const runtimeProcedures = {
  franceconnect: { disconnected: franceconnectDisconnected },
  member: { removed: memberRemoved, updated: memberUpdated },
  user: { deleted: userDeleted },
};
