//

import { franceconnectDisconnected } from "#src/franceconnect";
import { memberJoined, memberRemoved, memberUpdated } from "#src/memberships";
import {
  organizationCreated,
  organizationInfoChanged,
} from "#src/organizations";
import { userDeleted } from "#src/users";

//

export const runtimeProcedures = {
  franceconnect: { disconnected: franceconnectDisconnected },
  member: {
    joined: memberJoined,
    removed: memberRemoved,
    updated: memberUpdated,
  },
  organization: {
    created: organizationCreated,
    info_changed: organizationInfoChanged,
  },
  user: { deleted: userDeleted },
};
