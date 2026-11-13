//

import { franceconnectDisconnected } from "#src/franceconnect";
import { memberJoined, memberRemoved, memberUpdated } from "#src/memberships";
import { userDeleted } from "#src/users";

//

export const runtimeProcedures = {
  franceconnect: { disconnected: franceconnectDisconnected },
  member: {
    joined: memberJoined,
    removed: memberRemoved,
    updated: memberUpdated,
  },
  user: { deleted: userDeleted },
};
