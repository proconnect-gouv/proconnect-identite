//

import {
  CertificationDirigeantDataSource,
  compareCriteria,
  MatchCriteria,
} from "@proconnect-gouv/proconnect.identite/managers/certification";
import * as z from "zod";

//

const ComparedValue = z.object({
  compared: z.string().nullable(),
  raw: z.string().nullable(),
});

export const certificationDirigeantActivities = {
  "certification_dirigeant.certified": z.object({
    inputs: z.object({}),
    outcome: z.object({
      source: CertificationDirigeantDataSource,
    }),
  }),
  "certification_dirigeant.close_matched": z.object({
    inputs: z.object({}),
    outcome: z.object({
      diff: z.partialRecord(
        MatchCriteria,
        z.object({ franceconnect: ComparedValue, source: ComparedValue }),
      ),
      source: CertificationDirigeantDataSource,
    }),
  }),
  "certification_dirigeant.not_covered": z.object({
    inputs: z.object({}),
    outcome: z.object({}),
  }),
  "certification_dirigeant.not_matched": z.object({
    inputs: z.object({}),
    outcome: z.object({
      reason: z.enum(["below_threshold", "no_candidates"]),
      source: CertificationDirigeantDataSource,
    }),
  }),
};

//

type CloseMatchDiff = z.infer<
  (typeof certificationDirigeantActivities)["certification_dirigeant.close_matched"]
>["outcome"]["diff"];

export function closeMatchDiff(
  identity: Parameters<typeof compareCriteria>[0],
  dirigeant: Parameters<typeof compareCriteria>[1],
): CloseMatchDiff {
  return Object.fromEntries(
    compareCriteria(identity, dirigeant)
      .filter(({ matched }) => !matched)
      .map(({ criterion, franceconnect, source }) => [
        criterion,
        { franceconnect, source },
      ]),
  );
}
