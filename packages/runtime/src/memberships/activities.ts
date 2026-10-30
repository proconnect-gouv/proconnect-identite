//

import { LinkEnum } from "@proconnect-gouv/proconnect.identite/types";
import * as z from "zod";

//

export const membershipActivities = {
  "member.joined": z.object({
    inputs: z.object({
      is_external: z.boolean(),
      verification_type: z.string(),
    }),
    outcome: z.object({}),
  }),
  "member.promoted": z.object({
    inputs: z.object({
      previous_verification_type: z.string(),
    }),
    outcome: z.object({
      verification_type: LinkEnum,
    }),
  }),
  "member.removed": z.object({
    inputs: z.object({}),
    outcome: z.object({
      is_external: z.boolean(),
      verification_type: z.string(),
    }),
  }),
  "member.updated": z.object({
    inputs: z.object({
      is_external: z.boolean().optional(),
      renew_verification: z.boolean().optional(),
      verification_type: z.string().optional(),
    }),
    outcome: z.object({
      previous: z.object({
        is_external: z.boolean(),
        verification_type: z.string(),
      }),
    }),
  }),
};
