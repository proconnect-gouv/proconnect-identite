//

import type { Context } from "#src/connectors";
import { LinkTypes, SuperWeakLinkTypes, UnverifiedLinkTypes } from "#src/types";
import { getEmailDomain } from "@proconnect-gouv/proconnect.core/services/email";
import { match } from "ts-pattern";

//

export function assignUserVerificationTypeToDomainFactory({
  repo: { organizations, users_organizations },
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
            match(link_verification_type)
              .with(...UnverifiedLinkTypes, ...SuperWeakLinkTypes, () => true)
              .otherwise(() => false)
          ) {
            return users_organizations.update(organization_id, id, {
              verification_type: LinkTypes.enum.domain,
            });
          }

          return null;
        },
      ),
    );
  };
}
