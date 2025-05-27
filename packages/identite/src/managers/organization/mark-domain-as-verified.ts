//

import { NotFoundError } from "#src/errors";
import type { GetUsersByOrganizationHandler } from "#src/repositories/organization";
import type { UpdateUserOrganizationLinkHandler } from "#src/repositories/user";
import { getEmailDomain } from "@gouvfr-lasuite/proconnect.core/services/email";
import type {
  AddDomainHandler,
  DeleteEmailDomainsByVerificationTypesHandler,
} from "@gouvfr-lasuite/proconnect.identite/repositories/email-domain";
import type { FindByIdHandler } from "@gouvfr-lasuite/proconnect.identite/repositories/organization";
import {
  EMAIL_DOMAIN_APPROVED_VERIFICATION_TYPES,
  EMAIL_DOMAIN_REJECTED_VERIFICATION_TYPES,
  type EmailDomain,
  type EmailDomainApprovedVerificationType,
  type EmailDomainRejectedVerificationType,
} from "@gouvfr-lasuite/proconnect.identite/types";
import { isEmpty } from "lodash-es";

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
  return async function markDomainAsVerified({
    organization_id,
    domain,
    domain_verification_type,
  }: {
    organization_id: number;
    domain: string;
    domain_verification_type: NonNullable<EmailDomain["verification_type"]>;
  }) {
    const organization = await findOrganizationById(organization_id);

    if (isEmpty(organization)) {
      throw new NotFoundError();
    }

    if (
      EMAIL_DOMAIN_APPROVED_VERIFICATION_TYPES.includes(
        domain_verification_type as EmailDomainApprovedVerificationType,
      )
    ) {
      await assignUserVerificationTypeToDomain(organization_id, domain);

      return markDomainAsApproved({
        organization_id,
        domain,
        domain_verification_type:
          domain_verification_type as EmailDomainApprovedVerificationType,
      });
    }

    if (
      EMAIL_DOMAIN_REJECTED_VERIFICATION_TYPES.includes(
        domain_verification_type as EmailDomainRejectedVerificationType,
      )
    ) {
      return markDomainAsRejected({
        organization_id,
        domain,
        domain_verification_type:
          domain_verification_type as EmailDomainRejectedVerificationType,
      });
    }
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
        ...EMAIL_DOMAIN_APPROVED_VERIFICATION_TYPES,
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
        ...EMAIL_DOMAIN_REJECTED_VERIFICATION_TYPES,
      ],
    });
    return addDomain({
      organization_id,
      domain,
      verification_type: domain_verification_type,
    });
  }

  async function assignUserVerificationTypeToDomain(
    organization_id: number,
    domain: string,
  ) {
    const usersInOrganization = await getUsers(organization_id);

    await Promise.all(
      usersInOrganization.map(
        ({ id, email, verification_type: link_verification_type }) => {
          const userDomain = getEmailDomain(email);
          if (
            userDomain === domain &&
            [
              null,
              "no_verification_means_available",
              "no_verification_means_for_entreprise_unipersonnelle",
            ].includes(link_verification_type)
          ) {
            return updateUserOrganizationLink(organization_id, id, {
              verification_type: "domain",
            });
          }

          return null;
        },
      ),
    );
  }
}

export type MarkDomainAsVerifiedHandler = ReturnType<
  typeof markDomainAsVerifiedFactory
>;
