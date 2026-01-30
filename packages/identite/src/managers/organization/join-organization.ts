//

import {
  isEntrepriseUnipersonnelle,
  isSmallAssociation,
} from "#src/services/organization";
import type { LinkTypes, Organization } from "#src/types";
import type { z } from "zod";

//

type VerificationType = z.infer<typeof LinkTypes>;

export type JoinDecision =
  | { type: "error"; reason: "organization_not_active" }
  | { type: "link"; verification_type: VerificationType }
  | { type: "needs_external_verification" };

//

export function joinOrganization(organization: Organization): JoinDecision {
  if (!organization.cached_est_active) {
    return { type: "error", reason: "organization_not_active" };
  }

  if (isEntrepriseUnipersonnelle(organization)) {
    return {
      type: "link",
      verification_type: "no_verification_means_for_entreprise_unipersonnelle",
    };
  }

  if (isSmallAssociation(organization)) {
    return {
      type: "link",
      verification_type: "no_verification_means_for_small_association",
    };
  }

  return { type: "needs_external_verification" };
}
