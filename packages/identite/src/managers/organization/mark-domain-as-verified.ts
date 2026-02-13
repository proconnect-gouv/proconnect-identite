//

import { NotFoundError } from "#src/errors";
import { assignUserVerificationTypeToDomainFactory } from "#src/managers/user";
import type {
  AddDomainHandler,
  DeleteEmailDomainsByVerificationTypesHandler,
} from "#src/repositories/email-domain";
import type {
  FindByIdHandler,
  GetUsersByOrganizationHandler,
} from "#src/repositories/organization";
import type { UpdateUserOrganizationLinkHandler } from "#src/repositories/user";
import {
  EMAIL_DOMAIN_APPROVED_VERIFICATION_TYPES,
  EMAIL_DOMAIN_REJECTED_VERIFICATION_TYPES,
  type EmailDomainApprovedVerificationType,
  type EmailDomainRejectedVerificationType,
  type EmailDomainVerificationType,
} from "#src/types";
import { isEmpty } from "lodash-es";
import { match } from "ts-pattern";

//

type FactoryDependencies = {
  addDomain: AddDomainHandler;
  deleteEmailDomainsByVerificationTypes: DeleteEmailDomainsByVerificationTypesHandler;
  findOrganizationById: FindByIdHandler;
  getUsers: GetUsersByOrganizationHandler;
  updateUserOrganizationLink: UpdateUserOrganizationLinkHandler;
};

export function markDomainAsVerifiedFactory({
  addDomain,
  deleteEmailDomainsByVerificationTypes,
  findOrganizationById,
  getUsers,
  updateUserOrganizationLink,
}: FactoryDependencies) {
  const assignUserVerificationTypeToDomain =
    assignUserVerificationTypeToDomainFactory({
      getUsers,
      updateUserOrganizationLink,
    });
  return async function markDomainAsVerified({
    organization_id,
    domain,
    domain_verification_type,
  }: {
    organization_id: number;
    domain: string;
    domain_verification_type: NonNullable<EmailDomainVerificationType>;
  }) {
    const organization = await findOrganizationById(organization_id);

    if (isEmpty(organization)) {
      throw new NotFoundError();
    }

    return match(domain_verification_type)
      .with(
        EMAIL_DOMAIN_APPROVED_VERIFICATION_TYPES.enum.official_contact,
        EMAIL_DOMAIN_APPROVED_VERIFICATION_TYPES.enum.trackdechets_postal_mail,
        EMAIL_DOMAIN_APPROVED_VERIFICATION_TYPES.enum.verified,
        ...EMAIL_DOMAIN_APPROVED_VERIFICATION_TYPES.options,
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
        EMAIL_DOMAIN_REJECTED_VERIFICATION_TYPES.enum.blacklisted,
        EMAIL_DOMAIN_REJECTED_VERIFICATION_TYPES.enum.external,
        EMAIL_DOMAIN_REJECTED_VERIFICATION_TYPES.enum.refused,
        ...EMAIL_DOMAIN_REJECTED_VERIFICATION_TYPES.options,
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
    await deleteEmailDomainsByVerificationTypes({
      organization_id,
      domain,
      domain_verification_types: [
        ...EMAIL_DOMAIN_APPROVED_VERIFICATION_TYPES.options,
        null,
      ],
    });
    return addDomain({
      organization_id,
      domain,
      verification_type: domain_verification_type,
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
    await deleteEmailDomainsByVerificationTypes({
      organization_id,
      domain,
      domain_verification_types: [
        null,
        ...EMAIL_DOMAIN_REJECTED_VERIFICATION_TYPES.options,
      ],
    });
    return addDomain({
      organization_id,
      domain,
      verification_type: domain_verification_type,
    });
  }
}

export type MarkDomainAsVerifiedHandler = ReturnType<
  typeof markDomainAsVerifiedFactory
>;
