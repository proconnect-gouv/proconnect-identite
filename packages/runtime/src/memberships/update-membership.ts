//

import type { ActivityContexts, RuntimeContext } from "#src/activity";
import { insertActivity } from "#src/journal";
import { users_organizations } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import {
  SuperWeakLinkEnum,
  type LinkType,
} from "@proconnect-gouv/proconnect.identite/types";
import { and, eq, sql } from "drizzle-orm";

//

type UpdateMembershipOutcome =
  | {
      kind: "member_updated";
      activity_id: number;
      previous: {
        is_external: boolean;
        verification_type: string;
      };
    }
  | { kind: "membership_not_found"; organization_id: number; user_id: number }
  | { kind: "membership_unchanged"; organization_id: number; user_id: number };

export function updateMembershipFactory({ actor, app, db }: RuntimeContext) {
  return function updateMembership({
    is_external,
    organization_id,
    renew_verification,
    user_id,
    verification_type,
  }: {
    is_external?: boolean;
    organization_id: number;
    user_id: number;
  } & (
    | { renew_verification: true; verification_type: LinkType }
    | { renew_verification?: false; verification_type?: LinkType }
  )): Promise<UpdateMembershipOutcome> {
    return db.transaction(async (tx) => {
      const link = and(
        eq(users_organizations.organization_id, organization_id),
        eq(users_organizations.user_id, user_id),
      );
      const [previous] = await tx
        .select({
          is_external: users_organizations.is_external,
          verification_type: users_organizations.verification_type,
        })
        .from(users_organizations)
        .where(link)
        .for("update");

      if (!previous) {
        return { kind: "membership_not_found", organization_id, user_id };
      }

      if (
        renew_verification !== true &&
        (is_external ?? previous.is_external) === previous.is_external &&
        (verification_type ?? previous.verification_type) ===
          previous.verification_type
      ) {
        return { kind: "membership_unchanged", organization_id, user_id };
      }

      const fields = {
        ...(is_external === undefined ? {} : { is_external }),
        ...(verification_type === undefined ? {} : { verification_type }),
      };

      const inputs = {
        ...fields,
        ...(renew_verification === true ? { renew_verification: true } : {}),
      };

      await tx
        .update(users_organizations)
        .set({
          ...fields,
          ...(verification_type === undefined
            ? {}
            : {
                verified_at: SuperWeakLinkEnum.safeParse(verification_type)
                  .success
                  ? null
                  : sql`now()`,
              }),
          updated_at: sql`now()`,
        })
        .where(link);

      const { activity_id } = await insertActivity<ActivityContexts>(tx, {
        action: "member.updated",
        actor,
        app,
        context: { inputs, outcome: { previous } },
        organization_id,
        user_id,
      });

      return { kind: "member_updated", activity_id, previous };
    });
  };
}
