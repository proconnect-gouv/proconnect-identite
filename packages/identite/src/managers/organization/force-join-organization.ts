//

import type { FindEmailDomainsByOrganizationIdHandler } from "#src/repositories/email-domain";
import type {
  GetByIdHandler as GetOrganizationByIdHandler,
  LinkUserToOrganizationHandler,
} from "#src/repositories/organization";
import type { GetByIdHandler as GetUserByIdHandler } from "#src/repositories/user";
import { type BaseUserOrganizationLink, LinkTypes } from "#src/types";
import { getEmailDomain } from "@proconnect-gouv/proconnect.core/services/email";
import { match } from "ts-pattern";

//

type FactoryDependencies = {
  findEmailDomainsByOrganizationId: FindEmailDomainsByOrganizationIdHandler;
  getById: GetOrganizationByIdHandler;
  getUserById: GetUserByIdHandler;
  linkUserToOrganization: LinkUserToOrganizationHandler;
};

//

export function forceJoinOrganizationFactory({
  findEmailDomainsByOrganizationId,
  getById,
  getUserById,
  linkUserToOrganization,
}: FactoryDependencies) {
  return async function forceJoinOrganization({
    organization_id,
    user_id,
    is_external = false,
  }: {
    organization_id: number;
    user_id: number;
    is_external?: boolean;
  }) {
    const user = await getUserById(user_id);

    // Ensure that the organization exists (Ceinture Bretelle)
    await getById(organization_id);

    const { email } = user;
    const domain = getEmailDomain(email);
    const organizationEmailDomains =
      await findEmailDomainsByOrganizationId(organization_id);

    const link_verification_type = organizationEmailDomains
      .filter(({ domain: currentDomain }) => currentDomain === domain)
      .reduce(
        (acc, { verification_type }) => {
          if (acc === "domain") {
            return acc;
          }

          return match(verification_type)
            .with(
              "verified",
              "trackdechets_postal_mail",
              "external",
              "official_contact",
              () => LinkTypes.enum.domain,
            )
            .with(
              null,
              "blacklisted",
              "refused",
              () => LinkTypes.enum.no_validation_means_available,
            )
            .exhaustive();
        },
        "no_validation_means_available" as BaseUserOrganizationLink["verification_type"],
      );

    return await linkUserToOrganization({
      organization_id,
      user_id,
      is_external,
      verification_type: link_verification_type,
    });
  };
}

export type ForceJoinOrganizationHandler = ReturnType<
  typeof forceJoinOrganizationFactory
>;
