//

import type { ActivityContexts, RuntimeContext } from "#src/activity";
import { insertActivity } from "#src/journal";
import { franceconnect_userinfo } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { eq } from "drizzle-orm";

//

type DisconnectFranceConnectOutcome =
  | {
      kind: "franceconnect_disconnected";
      activity_id: number;
      connected_at: string;
    }
  | { kind: "franceconnect_identity_not_found"; user_id: number };

export function disconnectFranceConnectFactory({
  actor,
  app,
  db,
}: RuntimeContext) {
  return function disconnectFranceConnect({
    user_id,
  }: {
    user_id: number;
  }): Promise<DisconnectFranceConnectOutcome> {
    return db.transaction(async (tx) => {
      const [previous] = await tx
        .delete(franceconnect_userinfo)
        .where(eq(franceconnect_userinfo.user_id, user_id))
        .returning({ created_at: franceconnect_userinfo.created_at });

      if (!previous) {
        return { kind: "franceconnect_identity_not_found", user_id };
      }

      const { activity_id } = await insertActivity<ActivityContexts>(tx, {
        action: "franceconnect.disconnected",
        actor,
        app,
        context: { inputs: {}, outcome: { connected_at: previous.created_at } },
        user_id,
      });

      return {
        kind: "franceconnect_disconnected",
        activity_id,
        connected_at: previous.created_at,
      };
    });
  };
}
