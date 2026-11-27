//

import { procedure } from "#src/procedure";
import { users_organizations } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { SuperWeakLinkEnum } from "@proconnect-gouv/proconnect.identite/types";
import { and, eq, sql } from "drizzle-orm";
import * as z from "zod";

//

export const memberUpdated = procedure
  .inputs(
    z.object({
      is_external: z.boolean().optional(),
      renew_verification: z.boolean().optional(),
      verification_type: z.string().optional(),
    }),
  )
  .private(z.object({ organization_id: z.number(), user_id: z.number() }))
  .outcome(
    z.object({
      previous: z.object({
        is_external: z.boolean(),
        verification_type: z.string(),
      }),
    }),
  )
  .mutation(
    async ({
      inputs: { is_external, renew_verification, verification_type },
      private: { organization_id, user_id },
      tx,
    }) => {
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
        return {
          kind: "membership_not_found",
          organization_id,
          user_id,
        } as const;
      }

      if (
        renew_verification !== true &&
        (is_external ?? previous.is_external) === previous.is_external &&
        (verification_type ?? previous.verification_type) ===
          previous.verification_type
      ) {
        return {
          kind: "membership_unchanged",
          organization_id,
          user_id,
        } as const;
      }

      const fields = {
        ...(is_external === undefined ? {} : { is_external }),
        ...(verification_type === undefined ? {} : { verification_type }),
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

      return {
        journal: {
          outcome: { previous },
          targets: { organization_id, user_id },
        },
        kind: "member_updated",
        previous,
      } as const;
    },
  );
