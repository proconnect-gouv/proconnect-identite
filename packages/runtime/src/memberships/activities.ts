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
};
