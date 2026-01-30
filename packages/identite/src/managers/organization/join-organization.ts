//

import {
  hasLessThanFiftyEmployees,
  isCommune,
  isDomainAllowedForOrganization,
  isEntrepriseUnipersonnelle,
  isEtablissementScolaireDuPremierEtSecondDegre,
  isPublicService,
  isSmallAssociation,
  isSyndicatCommunal,
} from "#src/services/organization";
import type { EmailDomain, LinkTypes, Organization } from "#src/types";
import type { z } from "zod";

//

type VerificationType = z.infer<typeof LinkTypes>;

export type JoinErrorReason =
  | "domain_not_allowed"
  | "domain_refused"
  | "gouv_fr_domain_forbidden_for_private_org"
  | "organization_not_active"
  | "public_service_requires_professional_email";

export type JoinDecision =
  | { type: "error"; reason: JoinErrorReason }
  | {
      type: "link";
      verification_type: VerificationType;
      is_external?: boolean;
      needs_official_contact_email_verification?: boolean;
      should_mark_contact_domain_verified?: boolean;
    }
  | { type: "needs_confirmation" }
  | { type: "moderation_required"; moderation_type: "non_verified_domain" }
  | { type: "unable_to_auto_join" };

export interface JoinContext {
  contactEmail: string | null;
  contactEmailDomain: string | null;
  domain: string;
  featureBypassModeration: boolean;
  isContactEmailFreeProvider: boolean;
  isContactEmailValid: boolean;
  isFreeEmailProvider: boolean;
  organization: Organization;
  organizationEmailDomains: EmailDomain[];
  userEmail: string;
  userHasConfirmed: boolean;
}

//

export function joinOrganization(context: JoinContext): JoinDecision {
  const {
    contactEmail,
    contactEmailDomain,
    domain,
    featureBypassModeration,
    isContactEmailFreeProvider,
    isContactEmailValid,
    isFreeEmailProvider,
    organization,
    organizationEmailDomains,
    userEmail,
    userHasConfirmed,
  } = context;

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

  if (!isDomainAllowedForOrganization(organization.siret, domain)) {
    return { type: "error", reason: "domain_not_allowed" };
  }

  const isDomainRefused = organizationEmailDomains.some(
    (d) => d.domain === domain && d.verification_type === "refused",
  );
  if (isDomainRefused) {
    return { type: "error", reason: "domain_refused" };
  }

  if (domain.endsWith("gouv.fr") && !isPublicService(organization)) {
    return {
      type: "error",
      reason: "gouv_fr_domain_forbidden_for_private_org",
    };
  }

  if (
    !isCommune(organization, true) &&
    isFreeEmailProvider &&
    isPublicService(organization) &&
    !isSyndicatCommunal(organization)
  ) {
    return {
      type: "error",
      reason: "public_service_requires_professional_email",
    };
  }

  if (
    isFreeEmailProvider &&
    !hasLessThanFiftyEmployees(organization) &&
    !userHasConfirmed &&
    !isSyndicatCommunal(organization)
  ) {
    return { type: "needs_confirmation" };
  }

  const isCommuneNotSchool =
    isCommune(organization) &&
    !isEtablissementScolaireDuPremierEtSecondDegre(organization);

  if (isCommuneNotSchool && isContactEmailValid) {
    if (contactEmail === userEmail) {
      return {
        type: "link",
        verification_type: "official_contact_email",
        should_mark_contact_domain_verified: !isContactEmailFreeProvider,
      };
    }

    if (!isContactEmailFreeProvider && contactEmailDomain === domain) {
      return {
        type: "link",
        verification_type: "domain",
        should_mark_contact_domain_verified: true,
      };
    }

    return {
      type: "link",
      verification_type: "code_sent_to_official_contact_email",
      needs_official_contact_email_verification: true,
      should_mark_contact_domain_verified: !isContactEmailFreeProvider,
    };
  }

  const isSchool = isEtablissementScolaireDuPremierEtSecondDegre(organization);

  if (isSchool) {
    if (contactEmail === userEmail) {
      return {
        type: "link",
        verification_type: "official_contact_email",
      };
    }

    if (isContactEmailValid) {
      return {
        type: "link",
        verification_type: "code_sent_to_official_contact_email",
        needs_official_contact_email_verification: true,
      };
    }
  }

  const hasVerifiedDomain = organizationEmailDomains.some(
    (d) => d.domain === domain && d.verification_type === "verified",
  );
  if (hasVerifiedDomain) {
    return {
      type: "link",
      verification_type: "domain",
    };
  }

  const hasExternalDomain = organizationEmailDomains.some(
    (d) => d.domain === domain && d.verification_type === "external",
  );
  if (hasExternalDomain) {
    return {
      type: "link",
      verification_type: "domain",
      is_external: true,
    };
  }

  const hasTrackdechetsDomain = organizationEmailDomains.some(
    (d) =>
      d.domain === domain && d.verification_type === "trackdechets_postal_mail",
  );
  if (hasTrackdechetsDomain) {
    return {
      type: "link",
      verification_type: "domain",
    };
  }

  if (featureBypassModeration) {
    return {
      type: "link",
      verification_type: "bypassed",
    };
  }

  const hasUnverifiedDomain = organizationEmailDomains.some(
    (d) => d.domain === domain && d.verification_type === null,
  );
  if (hasUnverifiedDomain) {
    return {
      type: "moderation_required",
      moderation_type: "non_verified_domain",
    };
  }

  return { type: "unable_to_auto_join" };
}
