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
import type { EmailDomain, Organization } from "#src/types";

//

export type JoinErrorReason =
  | "domain_not_allowed"
  | "domain_refused"
  | "gouv_fr_domain_forbidden_for_private_org"
  | "organization_not_active"
  | "public_service_requires_professional_email";

type LinkDecision = {
  type: "link";
  verification_type: string;
  is_external?: boolean;
  needs_official_contact_email_verification?: boolean;
  should_mark_contact_domain_verified?: boolean;
};

export type JoinDecision =
  | { type: "error"; reason: JoinErrorReason }
  | LinkDecision
  | { type: "needs_confirmation" }
  | { type: "moderation_required"; moderation_type: "non_verified_domain" }
  | { type: "unable_to_auto_join" };

export interface JoinContext {
  contactEmail: string | null;
  domain: string;
  featureBypassModeration: boolean;
  isContactDomainFree: boolean;
  isContactEmailSameDomain: boolean;
  isContactEmailValid: boolean;
  isFreeEmailProvider: boolean;
  organization: Organization;
  organizationEmailDomains: EmailDomain[];
  userEmail: string;
  userHasConfirmed: boolean;
}

//

const link = (
  verification_type: string,
  options?: Partial<Omit<LinkDecision, "type" | "verification_type">>,
): LinkDecision => ({ type: "link", verification_type, ...options });

const error = (reason: JoinErrorReason) => ({ type: "error", reason }) as const;

//

export function joinOrganization(ctx: JoinContext): JoinDecision {
  const { domain, organization, organizationEmailDomains } = ctx;

  const domainVerificationType = organizationEmailDomains.find(
    (d) => d.domain === domain,
  )?.verification_type;

  if (!organization.cached_est_active) {
    return error("organization_not_active");
  }

  if (isEntrepriseUnipersonnelle(organization)) {
    return link("no_verification_means_for_entreprise_unipersonnelle");
  }

  if (isSmallAssociation(organization)) {
    return link("no_verification_means_for_small_association");
  }

  if (!isDomainAllowedForOrganization(organization.siret, domain)) {
    return error("domain_not_allowed");
  }

  if (domainVerificationType === "refused") {
    return error("domain_refused");
  }

  if (domain.endsWith("gouv.fr") && !isPublicService(organization)) {
    return error("gouv_fr_domain_forbidden_for_private_org");
  }

  const allowsFreeEmail =
    isCommune(organization, true) || isSyndicatCommunal(organization);

  if (
    ctx.isFreeEmailProvider &&
    isPublicService(organization) &&
    !allowsFreeEmail
  ) {
    return error("public_service_requires_professional_email");
  }

  const needsConfirmation =
    ctx.isFreeEmailProvider &&
    !hasLessThanFiftyEmployees(organization) &&
    !ctx.userHasConfirmed &&
    !isSyndicatCommunal(organization);

  if (needsConfirmation) {
    return { type: "needs_confirmation" };
  }

  const officialContactDecision = tryOfficialContactVerification(ctx);
  if (officialContactDecision) {
    return officialContactDecision;
  }

  if (domainVerificationType === "verified") {
    return link("domain");
  }

  if (domainVerificationType === "external") {
    return link("domain", { is_external: true });
  }

  if (domainVerificationType === "trackdechets_postal_mail") {
    return link("domain");
  }

  if (ctx.featureBypassModeration) {
    return link("bypassed");
  }

  if (domainVerificationType === null) {
    return {
      type: "moderation_required",
      moderation_type: "non_verified_domain",
    };
  }

  return { type: "unable_to_auto_join" };
}

function tryOfficialContactVerification(ctx: JoinContext): LinkDecision | null {
  const { organization, contactEmail, userEmail, isContactEmailValid } = ctx;

  const isSchool = isEtablissementScolaireDuPremierEtSecondDegre(organization);
  const isCommuneNotSchool = isCommune(organization) && !isSchool;

  if (!isCommuneNotSchool && !isSchool) {
    return null;
  }

  const markDomainVerified = isCommuneNotSchool && !ctx.isContactDomainFree;

  if (contactEmail === userEmail) {
    return link("official_contact_email", {
      should_mark_contact_domain_verified: markDomainVerified,
    });
  }

  if (isCommuneNotSchool && isContactEmailValid) {
    if (ctx.isContactEmailSameDomain && !ctx.isContactDomainFree) {
      return link("domain", { should_mark_contact_domain_verified: true });
    }
    return link("code_sent_to_official_contact_email", {
      needs_official_contact_email_verification: true,
      should_mark_contact_domain_verified: markDomainVerified,
    });
  }

  if (isSchool && isContactEmailValid) {
    return link("code_sent_to_official_contact_email", {
      needs_official_contact_email_verification: true,
    });
  }

  return null;
}
