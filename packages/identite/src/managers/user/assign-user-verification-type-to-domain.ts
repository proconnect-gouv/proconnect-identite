//

import type { Context } from "#src/connectors";
import { LinkEnum, SuperWeakLinkEnum, UnverifiedLinkEnum } from "#src/types";
import { getEmailDomain } from "@proconnect-gouv/proconnect.core/services/email";

//

export function assignUserVerificationTypeToDomainFactory({
  repository: { organizations, users_organizations },
}: Context) {
  return async function assignUserVerificationTypeToDomain(
    organization_id: number,
    domain: string,
  ) {
    const usersInOrganization = await organizations.getUsers(organization_id);

    await Promise.all(
      usersInOrganization.map(
        ({ id, email, verification_type: link_verification_type }) => {
          const userDomain = getEmailDomain(email);
          if (
            userDomain === domain &&
            (UnverifiedLinkEnum.safeParse(link_verification_type).success ||
              SuperWeakLinkEnum.safeParse(link_verification_type).success)
          ) {
            return users_organizations.update(organization_id, id, {
              verification_type: LinkEnum.enum.domain,
            });
          }

          return null;
        },
      ),
    );
  };
}
