//

import type { ActivityContexts, RuntimeContext } from "#src/activity";
import { insertActivity } from "#src/journal";
import { email_domains } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { eq } from "drizzle-orm";

//

type RemoveEmailDomainOutcome =
  | {
      kind: "domain_removed";
      activity_id: number;
      domain: string;
      organization_id: number;
      previous_verification_type: string;
    }
  | { kind: "domain_not_found"; email_domain_id: number };

export function removeEmailDomainFactory({ actor, app, db }: RuntimeContext) {
  return function removeEmailDomain({
    email_domain_id,
  }: {
    email_domain_id: number;
  }): Promise<RemoveEmailDomainOutcome> {
    return db.transaction(async (tx) => {
      const [removed] = await tx
        .delete(email_domains)
        .where(eq(email_domains.id, email_domain_id))
        .returning({
          domain: email_domains.domain,
          organization_id: email_domains.organization_id,
          previous_verification_type: email_domains.verification_type,
        });

      if (!removed) {
        return { kind: "domain_not_found", email_domain_id };
      }

      const { domain, organization_id, previous_verification_type } = removed;
      const { activity_id } = await insertActivity<ActivityContexts>(tx, {
        action: "domain.removed",
        actor,
        app,
        context: {
          inputs: { domain },
          outcome: { email_domain_id, previous_verification_type },
        },
        organization_id,
      });

      return {
        kind: "domain_removed",
        activity_id,
        domain,
        organization_id,
        previous_verification_type,
      };
    });
  };
}
