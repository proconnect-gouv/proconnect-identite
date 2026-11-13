//

import { procedure } from "#src/procedure";
import { franceconnect_userinfo } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { eq } from "drizzle-orm";
import * as z from "zod";

//

export const franceconnectDisconnected = procedure
  .inputs(z.object({}))
  .private(z.object({ user_id: z.number() }))
  .outcome(z.object({ connected_at: z.string() }))
  .mutation(async ({ private: { user_id }, tx }) => {
    const [previous] = await tx
      .delete(franceconnect_userinfo)
      .where(eq(franceconnect_userinfo.user_id, user_id))
      .returning({ created_at: franceconnect_userinfo.created_at });

    if (!previous) {
      return { kind: "franceconnect_identity_not_found", user_id } as const;
    }

    const connected_at = previous.created_at;
    return {
      connected_at,
      journal: { outcome: { connected_at }, targets: { user_id } },
      kind: "franceconnect_disconnected",
    } as const;
  });
