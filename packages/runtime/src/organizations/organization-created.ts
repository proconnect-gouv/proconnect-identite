//

import { procedure } from "#src/procedure";
import { organizations } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { toPartialOrganization } from "@proconnect-gouv/proconnect.identite/managers/organization";
import { OrganizationInfoSchema } from "@proconnect-gouv/proconnect.identite/types";
import { sql } from "drizzle-orm";
import * as z from "zod";

//

export const organizationCreated = procedure
  .inputs(z.object({ siret: z.string() }))
  .private(z.object({ organization_info: OrganizationInfoSchema }))
  .outcome(z.object({}))
  .mutation(
    async ({ inputs: { siret }, private: { organization_info }, tx }) => {
      const [inserted] = await tx
        .insert(organizations)
        .values({
          ...toPartialOrganization(organization_info),
          created_at: sql`now()`,
          organization_info_fetched_at: sql`now()`,
          siret,
          updated_at: sql`now()`,
        })
        .onConflictDoNothing({ target: organizations.siret })
        .returning({ organization_id: organizations.id });

      if (!inserted) {
        return { kind: "organization_exists" } as const;
      }

      const { organization_id } = inserted;
      return {
        journal: { outcome: {}, targets: { organization_id } },
        kind: "organization_created",
        organization_id,
      } as const;
    },
  );
