//

import type { GetUsersByOrganizationHandler } from "#src/repositories/organization";
import type { UpdateUserOrganizationLinkHandler } from "#src/repositories/user";
import { LinkTypes, UnverifiedLinkTypes } from "#src/types";
import { getEmailDomain } from "@proconnect-gouv/proconnect.core/services/email";
import { match } from "ts-pattern";

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
            match(link_verification_type)
              .with(...UnverifiedLinkTypes, () => true)
              .otherwise(() => false)
          ) {
            return updateUserOrganizationLink(organization_id, id, {
              verification_type: LinkTypes.enum.domain,
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
