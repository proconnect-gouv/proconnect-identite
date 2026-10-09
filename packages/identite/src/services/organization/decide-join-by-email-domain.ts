//

import {
  EmailDomainApprovedVerificationEnum,
  EmailDomainVerificationEnum,
  type EmailDomain,
} from "#src/types";

//

export function decide_join_by_email_domain({
  bypass_moderation,
  domain,
  organization_email_domains,
}: {
  bypass_moderation: boolean;
  domain: string;
  organization_email_domains: Pick<
    EmailDomain,
    "domain" | "verification_type"
  >[];
}) {
  const matching_email_domains = organization_email_domains.filter(
    (email_domain) => email_domain.domain === domain,
  );

  const approved_email_domain = matching_email_domains.find(
    ({ verification_type }) =>
      EmailDomainApprovedVerificationEnum.safeParse(verification_type).success,
  );

  if (approved_email_domain) {
    return {
      kind: "link_domain" as const,
      is_external:
        approved_email_domain.verification_type ===
        EmailDomainVerificationEnum.enum.external,
    };
  }

  if (bypass_moderation) return { kind: "bypassed" as const };

  if (
    matching_email_domains.some(
      ({ verification_type }) =>
        verification_type === EmailDomainVerificationEnum.enum.not_verified_yet,
    )
  ) {
    return { kind: "domain_not_verified_yet" as const };
  }

  return { kind: "unable_to_auto_join" as const };
}
