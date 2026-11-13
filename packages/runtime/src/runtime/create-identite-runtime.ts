//

import {
  activityContextSchemas,
  type ActivityContexts,
  type ActivityOf,
  type ActivityTargets,
  type Actor,
  type ContextMap,
  type RuntimeContext,
} from "#src/activity";
import type { IdentiteTransaction } from "#src/database";
import { changeEmailDomainVerificationFactory } from "#src/domains";
import { insertActivity } from "#src/journal";
import { addMembershipFactory } from "#src/memberships";
import {
  assertPublishedSchemas,
  bindProcedures,
  mergeProcedures,
  type ContextSchemasOf,
  type Disjoint,
  type Procedures,
} from "#src/procedure";
import { runtimeProcedures } from "#src/procedures";
import { resetMfaFactory } from "#src/users";

//

export function createIdentiteRuntime<
  OwnContexts extends ContextMap & {
    [Action in keyof ActivityContexts]?: never;
  } = {},
  AppProcedures extends Procedures = {},
>({
  app,
  db,
  procedures,
}: Omit<RuntimeContext, "actor"> & {
  procedures?: AppProcedures &
    Disjoint<
      ContextSchemasOf<typeof runtimeProcedures>,
      ContextSchemasOf<AppProcedures>
    >;
}) {
  assertPublishedSchemas(procedures, activityContextSchemas);
  const merged = mergeProcedures(runtimeProcedures, procedures);
  return {
    as(actor: Actor) {
      return {
        ...bindProcedures(merged, { actor, app, db }),
        addMembership: addMembershipFactory({ actor, app, db }),
        changeEmailDomainVerification: changeEmailDomainVerificationFactory({
          actor,
          app,
          db,
        }),
        record: (
          tx: IdentiteTransaction,
          activity: ActivityOf<OwnContexts> & ActivityTargets,
        ) => insertActivity<OwnContexts>(tx, { ...activity, actor, app }),
        resetMfa: resetMfaFactory({ actor, app, db }),
      };
    },
  };
}
