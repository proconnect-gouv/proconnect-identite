//

import { EmailDomainApprovedVerificationEnum } from "@proconnect-gouv/proconnect.identite/types";
import * as z from "zod";

//

export const domainActivities = {
  "domain.verified": z.object({
    inputs: z.object({
      domain: z.string(),
      verification_type: EmailDomainApprovedVerificationEnum,
    }),
    outcome: z.object({
      email_domain_id: z.number(),
      replaced_verification_types: z.array(z.string()),
    }),
  }),
};
