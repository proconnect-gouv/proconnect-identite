//

import { LinkEnum } from "@proconnect-gouv/proconnect.identite/types";
import * as z from "zod";

//

export const membershipActivities = {
  "member.promoted": z.object({
    inputs: z.object({
      previous_verification_type: z.string(),
    }),
    outcome: z.object({
      verification_type: LinkEnum,
    }),
  }),
  "official_contact.code_sent": z.object({
    inputs: z.object({}),
    outcome: z.object({ contact_email: z.string() }),
  }),
};
