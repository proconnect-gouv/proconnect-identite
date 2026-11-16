//

import { procedure } from "#src/procedure";
import { organizations } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { toPartialOrganization } from "@proconnect-gouv/proconnect.identite/managers/organization";
import {
  CachedOrganizationInfoSchema,
  OrganizationInfoSchema,
} from "@proconnect-gouv/proconnect.identite/types";
import { eq, sql } from "drizzle-orm";
import * as z from "zod";

//

const ChangedFieldsSchema = CachedOrganizationInfoSchema.partial();

export const organizationInfoChanged = procedure
  .inputs(z.object({ siret: z.string() }))
  .private(z.object({ organization_info: OrganizationInfoSchema }))
  .outcome(
    z.object({ next: ChangedFieldsSchema, previous: ChangedFieldsSchema }),
  )
  .mutation(
    async ({ inputs: { siret }, private: { organization_info }, tx }) => {
      const [previous] = await tx
        .select()
        .from(organizations)
        .where(eq(organizations.siret, siret))
        .for("update");

      if (!previous) {
        throw new Error(`organization ${siret} not found`);
      }

      const next = toPartialOrganization(organization_info);
      await tx
        .update(organizations)
        .set({
          ...next,
          organization_info_fetched_at: sql`now()`,
          siret,
          updated_at: sql`now()`,
        })
        .where(eq(organizations.id, previous.id));

      // journal both values of each cached field the INSEE refresh changed
      const before: Record<string, unknown> = previous;
      const changed = Object.entries(next).filter(
        ([key, value]) => before[key] !== value,
      );
      const organization_id = previous.id;
      if (changed.length === 0) {
        return {
          kind: "organization_info_unchanged",
          organization_id,
        } as const;
      }

      return {
        journal: {
          outcome: {
            next: ChangedFieldsSchema.parse(Object.fromEntries(changed)),
            previous: ChangedFieldsSchema.parse(
              Object.fromEntries(changed.map(([key]) => [key, before[key]])),
            ),
          },
          targets: { organization_id },
        },
        kind: "organization_info_changed",
        organization_id,
      } as const;
    },
  );
