//

import type { ActivityContexts, RuntimeContext } from "#src/activity";
import { insertActivity } from "#src/journal";
import {
  franceconnect_userinfo,
  users,
} from "@proconnect-gouv/proconnect.identite.database/drizzle";
import type { FranceConnectUserInfoResponse } from "@proconnect-gouv/proconnect.identite/types";
import { eq, sql } from "drizzle-orm";

//

type ConnectFranceConnectOutcome =
  | {
      kind: "franceconnect_connected";
      activity_id: number;
      connected_at: string;
      user: {
        family_name: string;
        given_name: string;
      };
    }
  | { kind: "user_not_found"; user_id: number };

export function connectFranceConnectFactory({
  actor,
  app,
  db,
}: RuntimeContext) {
  return function connectFranceConnect({
    user_id,
    user_info,
  }: {
    user_id: number;
    user_info: FranceConnectUserInfoResponse;
  }): Promise<ConnectFranceConnectOutcome> {
    return db.transaction(async (tx) => {
      const user = await tx.query.users.findFirst({
        columns: { id: true },
        where: (table, { eq }) => eq(table.id, user_id),
      });

      if (!user) {
        return { kind: "user_not_found", user_id };
      }

      const given_name = user_info.given_name.split(" ")[0];
      const family_name = user_info.preferred_username || user_info.family_name;

      await tx
        .update(users)
        .set({ family_name, given_name, updated_at: sql`now()` })
        .where(eq(users.id, user_id));

      const identity = {
        birthcountry: user_info.birthcountry,
        birthdate: user_info.birthdate.toISOString(),
        birthplace: user_info.birthplace,
        family_name: user_info.family_name,
        gender: user_info.gender,
        given_name: user_info.given_name,
        preferred_username: user_info.preferred_username,
        sub: user_info.sub,
        updated_at: sql`now()`,
        user_id,
      };
      const [franceconnect_identity] = await tx
        .insert(franceconnect_userinfo)
        .values(identity)
        .onConflictDoUpdate({
          target: franceconnect_userinfo.user_id,
          set: identity,
        })
        .returning({ created_at: franceconnect_userinfo.created_at });

      const { activity_id } = await insertActivity<ActivityContexts>(tx, {
        action: "franceconnect.connected",
        actor,
        app,
        context: {
          inputs: {},
          outcome: { connected_at: franceconnect_identity.created_at },
        },
        user_id,
      });

      return {
        kind: "franceconnect_connected",
        activity_id,
        connected_at: franceconnect_identity.created_at,
        user: { family_name, given_name },
      };
    });
  };
}
