//

import type { Context } from "#src/connectors";
import { NotFoundError } from "#src/errors";
import { assignUserVerificationTypeToDomainFactory } from "#src/managers/user";
import {
  type EmailDomainApprovedVerificationType,
  EmailDomainApprovedVerificationTypes,
  type EmailDomainNoPendingVerificationType,
  EmailDomainPendingVerificationTypes,
  type EmailDomainRejectedVerificationType,
  EmailDomainRejectedVerificationTypes,
  type EmailDomainVerificationType,
} from "#src/types";

import { isEmpty } from "lodash-es";
import { match } from "ts-pattern";

//

export function markDomainAsVerifiedFactory(context: Context) {
  const assignUserVerificationTypeToDomain =
    assignUserVerificationTypeToDomainFactory(context);

  const {
    repo: { email_domains, organizations },
  } = context;

  return async function markDomainAsVerified({
    organization_id,
    domain,
    domain_verification_type,
  }: {
    organization_id: number;
    domain: string;
    domain_verification_type: EmailDomainNoPendingVerificationType;
  }) {
    const organization = await organizations.findById(organization_id);

    if (isEmpty(organization)) {
      throw new NotFoundError();
    }

    return match(domain_verification_type)
      .with(
        ...EmailDomainApprovedVerificationTypes,
        async (approved_verification_type) => {
          await assignUserVerificationTypeToDomain(organization_id, domain);
          return markDomainAsApproved({
            organization_id,
            domain,
            domain_verification_type: approved_verification_type,
          });
        },
      )
      .with(
        ...EmailDomainRejectedVerificationTypes,
        (rejected_verification_type) =>
          markDomainAsRejected({
            organization_id,
            domain,
            domain_verification_type: rejected_verification_type,
          }),
      )
      .exhaustive();
  };

  async function markDomainAsApproved({
    organization_id,
    domain,
    domain_verification_type,
  }: {
    organization_id: number;
    domain: string;
    domain_verification_type: EmailDomainApprovedVerificationType;
  }) {
    await email_domains.deleteEmailDomainsByVerificationTypes({
      organization_id,
      domain,
      domain_verification_types: [
        ...EmailDomainApprovedVerificationTypes,
        ...EmailDomainPendingVerificationTypes,
      ],
    });
    return email_domains.addDomain({
      organization_id,
      domain,
      verification_type:
        domain_verification_type as EmailDomainVerificationType,
    });
  }

  async function markDomainAsRejected({
    organization_id,
    domain,
    domain_verification_type,
  }: {
    organization_id: number;
    domain: string;
    domain_verification_type: EmailDomainRejectedVerificationType;
  }) {
    await email_domains.deleteEmailDomainsByVerificationTypes({
      organization_id,
      domain,
      domain_verification_types: [
        ...EmailDomainPendingVerificationTypes,
        ...EmailDomainRejectedVerificationTypes,
      ],
    });
    return email_domains.addDomain({
      organization_id,
      domain,
      verification_type:
        domain_verification_type as EmailDomainVerificationType,
    });
  }
}

export type MarkDomainAsVerifiedHandler = ReturnType<
  typeof markDomainAsVerifiedFactory
>;
