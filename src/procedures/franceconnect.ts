import {
  franceconnect_userinfo,
  users,
} from "@proconnect-gouv/proconnect.identite.database/drizzle";
import {
  activityContextSchemas,
  procedure,
} from "@proconnect-gouv/proconnect.identite.runtime";
import { FranceConnectUserInfoResponseSchema } from "@proconnect-gouv/proconnect.identite/types";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const { inputs, outcome } =
  activityContextSchemas["franceconnect.connected"].shape;

export const franceconnectConnected = procedure
  .inputs(inputs)
  .private(
    z.object({
      user_id: z.number(),
      user_info: FranceConnectUserInfoResponseSchema,
    }),
  )
  .outcome(outcome)
  .mutation(async ({ private: { user_id, user_info }, tx }) => {
    const user = await tx.query.users.findFirst({
      columns: { id: true },
      where: (table, { eq }) => eq(table.id, user_id),
    });

    if (!user) {
      return { kind: "user_not_found", user_id } as const;
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

    const connected_at = franceconnect_identity.created_at;

    return {
      connected_at,
      journal: { outcome: { connected_at }, targets: { user_id } },
      kind: "franceconnect_connected",
      user: { family_name, given_name },
    } as const;
  });
