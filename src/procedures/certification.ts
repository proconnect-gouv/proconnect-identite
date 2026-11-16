import {
  certificationDirigeantActivities,
  procedure,
} from "@proconnect-gouv/proconnect.identite.runtime";
import { z } from "zod";

function checked<Inputs, Outcome>(
  context: z.ZodObject<{
    inputs: z.ZodType<Inputs>;
    outcome: z.ZodType<Outcome>;
  }>,
) {
  const { inputs, outcome } = context.shape;
  return procedure
    .inputs(inputs)
    .private(
      z.object({
        organization_id: z.number(),
        outcome,
        user_id: z.number(),
      }),
    )
    .outcome(outcome)
    .mutation(async ({ private: { organization_id, outcome, user_id } }) => ({
      journal: { outcome, targets: { organization_id, user_id } },
      kind: "checked" as const,
    }));
}

export const certificationDirigeantCertified = checked(
  certificationDirigeantActivities["certification_dirigeant.certified"],
);
export const certificationDirigeantCloseMatched = checked(
  certificationDirigeantActivities["certification_dirigeant.close_matched"],
);
export const certificationDirigeantNotCovered = checked(
  certificationDirigeantActivities["certification_dirigeant.not_covered"],
);
export const certificationDirigeantNotMatched = checked(
  certificationDirigeantActivities["certification_dirigeant.not_matched"],
);
