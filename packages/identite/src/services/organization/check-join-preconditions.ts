//

import {
  EmailDomainVerificationEnum,
  type EmailDomain,
  type Moderation,
  type Organization,
} from "#src/types";
import { computeServicePublicInfo } from "./compute-service-public-info.js";
import { isDomainAllowedForOrganization } from "./is-domain-allowed-for-organization.js";

//

export function check_join_preconditions({
  certification_requested,
  domain,
  organization,
  organization_email_domains,
  pending_moderation,
  rejected_moderation,
  user_organizations,
}: {
  certification_requested: boolean;
  domain: string;
  organization: Pick<
    Organization,
    "cached_categorie_juridique" | "cached_etat_administratif" | "id" | "siret"
  >;
  organization_email_domains: Pick<
    EmailDomain,
    "domain" | "verification_type"
  >[];
  pending_moderation: Pick<Moderation, "id"> | undefined;
  rejected_moderation: Pick<Moderation, "id"> | undefined;
  user_organizations: Pick<Organization, "id">[];
}) {
  if (user_organizations.some(({ id }) => id === organization.id)) {
    return { kind: "already_member" as const };
  }

  if (pending_moderation) {
    return {
      kind: "already_asked" as const,
      moderation_id: pending_moderation.id,
    };
  }

  if (rejected_moderation) {
    return {
      kind: "moderation_rejected" as const,
      moderation_id: rejected_moderation.id,
    };
  }

  if (!isDomainAllowedForOrganization(organization.siret, domain)) {
    return { kind: "domain_not_allowed" as const };
  }

  if (
    organization_email_domains.some(
      (email_domain) =>
        email_domain.domain === domain &&
        email_domain.verification_type ===
          EmailDomainVerificationEnum.enum.refused,
    )
  ) {
    return { kind: "domain_refused" as const };
  }

  if (
    domain.endsWith("gouv.fr") &&
    !computeServicePublicInfo(organization).isServicePublic
  ) {
    return { kind: "gouv_fr_forbidden_for_private_org" as const };
  }

  if (certification_requested) {
    return { kind: "pending_certification_dirigeant" as const };
  }

  return { kind: "ok" as const };
}
