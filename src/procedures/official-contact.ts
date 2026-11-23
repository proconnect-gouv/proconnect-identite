import { official_contact_email_verifications } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import {
  activityContextSchemas,
  procedure,
} from "@proconnect-gouv/proconnect.identite.runtime";
import { sql } from "drizzle-orm";
import { z } from "zod";

const sent = activityContextSchemas["official_contact.code_sent"].shape;

export const officialContactCodeSent = procedure
  .inputs(sent.inputs)
  .private(
    z.object({
      contact_email: z.string(),
      organization_id: z.number(),
      token: z.string(),
      user_id: z.number(),
    }),
  )
  .outcome(sent.outcome)
  .mutation(
    async ({
      private: { contact_email, organization_id, token, user_id },
      tx,
    }) => {
      await tx
        .insert(official_contact_email_verifications)
        .values({ organization_id, sent_at: sql`now()`, token, user_id })
        .onConflictDoUpdate({
          set: { sent_at: sql`now()`, token, updated_at: sql`now()` },
          target: [
            official_contact_email_verifications.organization_id,
            official_contact_email_verifications.user_id,
          ],
        });

      return {
        journal: {
          outcome: { contact_email },
          targets: { organization_id, user_id },
        },
        kind: "code_sent",
      } as const;
    },
  );
