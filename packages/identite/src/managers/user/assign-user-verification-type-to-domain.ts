//

import type { GetUsersByOrganizationHandler } from "#src/repositories/organization";
import type { UpdateUserOrganizationLinkHandler } from "#src/repositories/user";
import { getEmailDomain } from "@gouvfr-lasuite/proconnect.core/services/email";

//

type FactoryDependencies = {
  getUsers: GetUsersByOrganizationHandler;
  updateUserOrganizationLink: UpdateUserOrganizationLinkHandler;
};

export function assignUserVerificationTypeToDomainFactory({
  getUsers,
  updateUserOrganizationLink,
}: FactoryDependencies) {
  return async function assignUserVerificationTypeToDomain(
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
  };
}

export type AssignUserVerificationTypeToDomainFactoryHandler = ReturnType<
  typeof assignUserVerificationTypeToDomainFactory
>;
