//

import { procedure } from "#src/procedure";
import { users_organizations } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { and, eq } from "drizzle-orm";
import * as z from "zod";

//

export const memberRemoved = procedure
  .inputs(z.object({}))
  .private(
    z.object({
      organization_id: z.number(),
      user_id: z.number(),
    }),
  )
  .outcome(
    z.object({
      is_external: z.boolean(),
      verification_type: z.string(),
    }),
  )
  .mutation(async ({ private: { organization_id, user_id }, tx }) => {
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
      return {
        kind: "membership_not_found",
        organization_id,
        user_id,
      } as const;
    }

    return {
      journal: { outcome: previous, targets: { organization_id, user_id } },
      kind: "member_removed",
      previous,
    } as const;
  });
