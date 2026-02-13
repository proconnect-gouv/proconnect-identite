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
    domain_verification_type: EmailDomainNoPendingVerificationType;
  }) {
    const organization = await findOrganizationById(organization_id);

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
    await deleteEmailDomainsByVerificationTypes({
      organization_id,
      domain,
      domain_verification_types: [
        ...EmailDomainApprovedVerificationTypes,
        ...EmailDomainPendingVerificationTypes,
      ],
    });
    return addDomain({
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
    await deleteEmailDomainsByVerificationTypes({
      organization_id,
      domain,
      domain_verification_types: [
        ...EmailDomainPendingVerificationTypes,
        ...EmailDomainRejectedVerificationTypes,
      ],
    });
    return addDomain({
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
