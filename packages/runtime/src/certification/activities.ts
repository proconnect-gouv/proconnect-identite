//

import type { ActivityOf, ContextsOf } from "#src/activity";
import {
  CertificationDirigeantDataSource,
  compareCriteria,
  MatchCriteria,
  type processCertificationDirigeantFactory,
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

type CertificationDirigeantResult = Awaited<
  ReturnType<ReturnType<typeof processCertificationDirigeantFactory>>
>;

export function getCertificationDirigeantActivity(
  result: CertificationDirigeantResult,
): ActivityOf<ContextsOf<typeof certificationDirigeantActivities>> {
  switch (result.cause) {
    case "organisation_not_covered":
      return {
        action: "certification_dirigeant.not_covered",
        context: { inputs: {}, outcome: {} },
      };
    case "exact_match":
      return {
        action: "certification_dirigeant.certified",
        context: { inputs: {}, outcome: { source: result.details.source } },
      };
    case "close_match":
      return {
        action: "certification_dirigeant.close_matched",
        context: {
          inputs: {},
          outcome: {
            diff: Object.fromEntries(
              compareCriteria(result.details.identity, result.details.dirigeant)
                .filter(({ matched }) => !matched)
                .map(({ criterion, franceconnect, source }) => [
                  criterion,
                  { franceconnect, source },
                ]),
            ),
            source: result.details.source,
          },
        },
      };
    case "below_threshold":
    case "no_candidates":
      return {
        action: "certification_dirigeant.not_matched",
        context: {
          inputs: {},
          outcome: { reason: result.cause, source: result.details.source },
        },
      };
    default:
      return assert_never(result);
  }
}

function assert_never(value: never): never {
  throw new Error(`Unhandled certification result: ${JSON.stringify(value)}`);
}
