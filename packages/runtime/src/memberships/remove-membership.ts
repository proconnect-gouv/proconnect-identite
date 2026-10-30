//

import type { ActivityContexts, RuntimeContext } from "#src/activity";
import { insertActivity } from "#src/journal";
import { users_organizations } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { and, eq } from "drizzle-orm";

//

type RemoveMembershipOutcome =
  | {
      kind: "member_removed";
      activity_id: number;
      previous: {
        is_external: boolean;
        verification_type: string;
      };
    }
  | { kind: "membership_not_found"; organization_id: number; user_id: number };

export function removeMembershipFactory({ actor, app, db }: RuntimeContext) {
  return function removeMembership({
    organization_id,
    user_id,
  }: {
    organization_id: number;
    user_id: number;
  }): Promise<RemoveMembershipOutcome> {
    return db.transaction(async (tx) => {
      const [previous] = await tx
        .delete(users_organizations)
        .where(
          and(
            eq(users_organizations.organization_id, organization_id),
            eq(users_organizations.user_id, user_id),
          ),
        )
        .returning({
          is_external: users_organizations.is_external,
          verification_type: users_organizations.verification_type,
        });

      if (!previous) {
        return { kind: "membership_not_found", organization_id, user_id };
      }

      const { activity_id } = await insertActivity<ActivityContexts>(tx, {
        action: "member.removed",
        actor,
        app,
        context: { inputs: {}, outcome: previous },
        organization_id,
        user_id,
      });

      return { kind: "member_removed", activity_id, previous };
    });
  };
}
