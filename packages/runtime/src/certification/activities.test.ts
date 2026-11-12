//

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  certificationDirigeantActivities,
  getCertificationDirigeantActivity,
} from "./activities.js";

//

type Result = Parameters<typeof getCertificationDirigeantActivity>[0];

const ulysse = {
  birthcountry: "99100",
  birthdate: new Date("1992-09-07"),
  birthplace: "13055",
  family_name: "Tosi",
  gender: "male",
  given_name: "Ulysse",
} as const;

function result_of({
  cause,
  dirigeant = ulysse,
  source = "registre-national-entreprises.inpi.fr/api",
}: {
  cause: Result["cause"];
  dirigeant?: Record<string, unknown>;
  source?: string | null;
}) {
  return {
    cause,
    details: { dirigeant, identity: ulysse, matches: new Set(), source },
    ok: cause === "exact_match",
  } as unknown as Result;
}

describe("getCertificationDirigeantActivity", () => {
  it("records the registry of a certified dirigeant", () => {
    assert.deepEqual(
      getCertificationDirigeantActivity(result_of({ cause: "exact_match" })),
      {
        action: "certification_dirigeant.certified",
        context: {
          inputs: {},
          outcome: { source: "registre-national-entreprises.inpi.fr/api" },
        },
      },
    );
  });

  it("records only the differing criteria of a close match, as received and as compared", () => {
    assert.deepEqual(
      getCertificationDirigeantActivity(
        result_of({
          cause: "close_match",
          dirigeant: { ...ulysse, given_name: "Ulisse" },
        }),
      ),
      {
        action: "certification_dirigeant.close_matched",
        context: {
          inputs: {},
          outcome: {
            diff: {
              first_name: {
                franceconnect: { compared: "ULYSSE", raw: "Ulysse" },
                source: { compared: "ULISSE", raw: "Ulisse" },
              },
            },
            source: "registre-national-entreprises.inpi.fr/api",
          },
        },
      },
    );
  });

  it("records why no dirigeant matched", () => {
    assert.deepEqual(
      getCertificationDirigeantActivity(result_of({ cause: "no_candidates" })),
      {
        action: "certification_dirigeant.not_matched",
        context: {
          inputs: {},
          outcome: {
            reason: "no_candidates",
            source: "registre-national-entreprises.inpi.fr/api",
          },
        },
      },
    );
  });

  it("records an uncovered organization without any registry", () => {
    assert.deepEqual(
      getCertificationDirigeantActivity(
        result_of({ cause: "organisation_not_covered", source: null }),
      ),
      {
        action: "certification_dirigeant.not_covered",
        context: { inputs: {}, outcome: {} },
      },
    );
  });

  it("builds contexts their published schema accepts", () => {
    for (const cause of [
      "below_threshold",
      "close_match",
      "exact_match",
      "no_candidates",
      "organisation_not_covered",
    ] as const) {
      const { action, context } = getCertificationDirigeantActivity(
        result_of({
          cause,
          dirigeant: { ...ulysse, birthdate: null, family_name: "Tozi" },
        }),
      );

      assert.deepEqual(
        certificationDirigeantActivities[action].parse(context),
        context,
      );
    }
  });
});
