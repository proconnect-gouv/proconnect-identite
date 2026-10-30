//

import type {
  ActivityContexts,
  ActivityOf,
  ActivityTargets,
  Actor,
  ContextMap,
  RuntimeContext,
} from "#src/activity";
import type { IdentiteTransaction } from "#src/database";
import { markDomainAsVerifiedFactory } from "#src/domains";
import {
  connectFranceConnectFactory,
  disconnectFranceConnectFactory,
} from "#src/franceconnect";
import { insertActivity } from "#src/journal";
import {
  addMembershipFactory,
  removeMembershipFactory,
} from "#src/memberships";
import {
  cancelModerationFactory,
  openModerationFactory,
} from "#src/moderations";
import { deleteUserFactory, resetMfaFactory } from "#src/users";

//

export function createIdentiteRuntime<
  OwnContexts extends ContextMap & {
    [Action in keyof ActivityContexts]?: never;
  } = {},
>({ app, db }: Omit<RuntimeContext, "actor">) {
  return {
    as(actor: Actor) {
      return {
        addMembership: addMembershipFactory({ actor, app, db }),
        cancelModeration: cancelModerationFactory({ actor, app, db }),
        connectFranceConnect: connectFranceConnectFactory({ actor, app, db }),
        deleteUser: deleteUserFactory({ actor, app, db }),
        disconnectFranceConnect: disconnectFranceConnectFactory({
          actor,
          app,
          db,
        }),
        markDomainAsVerified: markDomainAsVerifiedFactory({ actor, app, db }),
        openModeration: openModerationFactory({ actor, app, db }),
        removeMembership: removeMembershipFactory({ actor, app, db }),
        record: (
          tx: IdentiteTransaction,
          activity: ActivityOf<OwnContexts> & ActivityTargets,
        ) => insertActivity<OwnContexts>(tx, { ...activity, actor, app }),
        resetMfa: resetMfaFactory({ actor, app, db }),
      };
    },
  };
}
