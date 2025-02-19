//

import { NotFoundError } from "#src/errors";
import type { GetUsersByOrganizationHandler } from "#src/repositories/organization";
import type { UpdateUserOrganizationLinkHandler } from "#src/repositories/user";
import { getEmailDomain } from "@gouvfr-lasuite/proconnect.core/services/email";
import type {
  AddDomainHandler,
  FindEmailDomainsByOrganizationIdHandler,
} from "@gouvfr-lasuite/proconnect.identite/repositories/email-domain";
import type { FindByIdHandler } from "@gouvfr-lasuite/proconnect.identite/repositories/organization";
import type { EmailDomain } from "@gouvfr-lasuite/proconnect.identite/types";
import { isEmpty, some } from "lodash-es";

//

type FactoryDependencies = {
  addDomain: AddDomainHandler;
  findEmailDomainsByOrganizationId: FindEmailDomainsByOrganizationIdHandler;
  findOrganizationById: FindByIdHandler;
  getUsers: GetUsersByOrganizationHandler;
  updateUserOrganizationLink: UpdateUserOrganizationLinkHandler;
};

export function markDomainAsVerifiedFactory({
  addDomain,
  findEmailDomainsByOrganizationId,
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
    domain_verification_type: EmailDomain["verification_type"];
  }) {
    const organization = await findOrganizationById(organization_id);
    if (isEmpty(organization)) {
      throw new NotFoundError();
    }
    const emailDomains =
      await findEmailDomainsByOrganizationId(organization_id);

    if (
      !some(emailDomains, {
        domain,
        verification_type: domain_verification_type,
      })
    ) {
      await addDomain({
        organization_id,
        domain,
        verification_type: domain_verification_type,
      });
    }
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

export type MarkDomainAsVerifiedHandler = ReturnType<
  typeof markDomainAsVerifiedFactory
>;
