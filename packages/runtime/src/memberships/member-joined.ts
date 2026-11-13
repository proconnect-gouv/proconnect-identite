//

import { procedure } from "#src/procedure";
import { users_organizations } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { sql } from "drizzle-orm";
import * as z from "zod";

//

export const memberJoined = procedure
  .inputs(z.object({ is_external: z.boolean(), verification_type: z.string() }))
  .private(z.object({ organization_id: z.number(), user_id: z.number() }))
  .outcome(z.object({}))
  .mutation(
    async ({
      inputs: { is_external, verification_type },
      private: { organization_id, user_id },
      tx,
    }) => {
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
        return {
          kind: "member_already_exists",
          organization_id,
          user_id,
        } as const;
      }

      return {
        journal: { outcome: {}, targets: { organization_id, user_id } },
        kind: "member_joined",
        membership,
      } as const;
    },
  );
