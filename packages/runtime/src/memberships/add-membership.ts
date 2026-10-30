//

import type { ActivityContexts, RuntimeContext } from "#src/activity";
import { insertActivity } from "#src/journal";
import { users_organizations } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import type { LinkType } from "@proconnect-gouv/proconnect.identite/types";
import { sql } from "drizzle-orm";

//

type AddMembershipOutcome =
  | {
      kind: "member_joined";
      activity_id: number;
      membership: {
        organization_id: number;
        user_id: number;
      };
    }
  | {
      kind: "member_already_exists";
      organization_id: number;
      user_id: number;
    };

export function addMembershipFactory({ actor, app, db }: RuntimeContext) {
  return function addMembership({
    is_external = false,
    organization_id,
    user_id,
    verification_type,
  }: {
    is_external?: boolean;
    organization_id: number;
    user_id: number;
    verification_type: LinkType;
  }): Promise<AddMembershipOutcome> {
    return db.transaction(async (tx) => {
      const [membership] = await tx
        .insert(users_organizations)
        .values({
          created_at: sql`now()`,
          is_external,
          organization_id,
          updated_at: sql`now()`,
          user_id,
          verification_type,
          verified_at: sql`now()`,
        })
        .onConflictDoNothing({
          target: [
            users_organizations.user_id,
            users_organizations.organization_id,
          ],
        })
        .returning({
          organization_id: users_organizations.organization_id,
          user_id: users_organizations.user_id,
        });

      if (!membership) {
        return { kind: "member_already_exists", organization_id, user_id };
      }

      const { activity_id } = await insertActivity<ActivityContexts>(tx, {
        action: "member.joined",
        actor,
        app,
        context: {
          inputs: { is_external, verification_type },
          outcome: {},
        },
        organization_id,
        user_id,
      });

      return { kind: "member_joined", activity_id, membership };
    });
  };
}
