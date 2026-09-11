//

import type { IdentityVector } from "#src/types";
import { match } from "ts-pattern";
import { certificationScore } from "./certification-score.js";

//

export function match_identity_to_dirigeant(
  identity: IdentityVector,
  dirigeants: IdentityVector[],
) {
  if (dirigeants.length === 0) return { kind: "no_candidates" as const };

  const [closest] = dirigeants
    .map((dirigeant) => ({
      dirigeant,
      matches: certificationScore(identity, dirigeant),
    }))
    .toSorted((a, b) => b.matches.size - a.matches.size); // Sort by score descending (higher is better)

  // According to the specification, only score of 5 (perfect match) is certified
  return match(closest.matches.size)
    .with(5, () => ({
      kind: "exact_match" as const,
      closest,
    }))
    .with(4, () => ({
      kind: "close_match" as const,
      closest,
    }))
    .with(3, () => ({
      kind: "close_match" as const,
      closest,
    }))
    .otherwise(() => ({
      kind: "below_threshold" as const,
      closest,
    }));
}
