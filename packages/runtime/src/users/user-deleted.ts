//

import { procedure } from "#src/procedure";
import { users } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { eq } from "drizzle-orm";
import * as z from "zod";

//

export const userDeleted = procedure
  .inputs(z.object({ user_id: z.number() }))
  .outcome(
    z.object({
      email: z.string(),
      family_name: z.string().nullable(),
      given_name: z.string().nullable(),
      memberships: z.array(
        z.object({
          is_external: z.boolean(),
          organization_id: z.number(),
          verification_type: z.string(),
        }),
      ),
    }),
  )
  .mutation(async ({ inputs: { user_id }, tx }) => {
    const memberships = await tx.query.users_organizations.findMany({
      columns: {
        is_external: true,
        organization_id: true,
        verification_type: true,
      },
      orderBy: (table, { asc }) => asc(table.organization_id),
      where: (table, { eq }) => eq(table.user_id, user_id),
    });

    const [user] = await tx
      .delete(users)
      .where(eq(users.id, user_id))
      .returning({
        email: users.email,
        family_name: users.family_name,
        given_name: users.given_name,
      });

    if (!user) {
      return { kind: "user_not_found", user_id } as const;
    }

    const previous = { ...user, memberships };
    return {
      journal: { outcome: previous, targets: { user_id } },
      kind: "user_deleted",
      previous,
    } as const;
  });
