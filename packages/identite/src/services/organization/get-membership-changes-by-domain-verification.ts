//

import {
  EmailDomainApprovedVerificationValues,
  EmailDomainRejectedVerificationValues,
  SuperWeakLinkEnum,
  UnverifiedLinkEnum,
  type EmailDomainNoPendingVerificationType,
} from "#src/types";
import { getEmailDomain } from "@proconnect-gouv/proconnect.core/services/email";
import { match } from "ts-pattern";

//

export function getMembershipChangesByDomainVerification<
  Member extends { email: string; verification_type: string },
>({
  domain,
  members,
  verification_type,
}: {
  domain: string;
  members: ReadonlyArray<Member>;
  verification_type: EmailDomainNoPendingVerificationType;
}) {
  const domain_members = members.filter(
    ({ email }) => getEmailDomain(email) === domain,
  );

  return match(verification_type)
    .with(...EmailDomainApprovedVerificationValues, (verification_type) => ({
      kind: "domain_approved" as const,
      promoted_members: domain_members.filter(
        ({ verification_type }) =>
          UnverifiedLinkEnum.safeParse(verification_type).success ||
          SuperWeakLinkEnum.safeParse(verification_type).success,
      ),
      verification_type,
    }))
    .with(...EmailDomainRejectedVerificationValues, (verification_type) => ({
      kind: "domain_refused" as const,
      removed_members: domain_members,
      verification_type,
    }))
    .exhaustive();
}
