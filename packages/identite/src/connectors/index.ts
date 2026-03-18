//

import type {
  ApiEntrepriseInfogreffeRepository,
  ApiEntrepriseInseeRepository,
} from "@proconnect-gouv/proconnect.api_entreprise/api";
import type { FindUniteLegaleBySirenHandler } from "@proconnect-gouv/proconnect.insee/api";
import type { FindPouvoirsBySirenHandler } from "@proconnect-gouv/proconnect.registre_national_entreprises/api";
import { type Pool } from "pg";
import { addDomainFactory } from "../repositories/email-domain/add-domain.js";
import { deleteEmailDomainsByVerificationTypesFactory } from "../repositories/email-domain/delete-email-domains-by-verification-types.js";
import { findEmailDomainsByOrganizationIdFactory } from "../repositories/email-domain/find-email-domains-by-organization-id.js";
import { findByIdFactory as findOrganizationByIdFactory } from "../repositories/organization/find-by-id.js";
import { findByUserIdFactory } from "../repositories/organization/find-by-user-id.js";
import { getUsersByOrganizationFactory } from "../repositories/organization/get-users-by-organization.js";
import { createUserFactory } from "../repositories/user/create.js";
import { findByEmailFactory } from "../repositories/user/find-by-email.js";
import { findByIdFactory as findUserByIdFactory } from "../repositories/user/find-by-id.js";
import { getByIdFactory } from "../repositories/user/get-by-id.js";
import { getFranceConnectUserInfoFactory } from "../repositories/user/get-franceconnect-user-info.js";
import { updateUserOrganizationLinkFactory } from "../repositories/user/update-user-organization-link.js";
import { updateUserFactory } from "../repositories/user/update.js";
import { upsertFranceconnectUserinfoFactory } from "../repositories/user/upsert-franceconnect-userinfo.js";

//

export function createContext({
  api_entreprise_infogreffe_client,
  api_entreprise_insee_client,
  api_insee_client,
  api_registre_national_entreprises_client,
  pg,
}: {
  api_entreprise_infogreffe_client: ApiEntrepriseInfogreffeRepository;
  api_entreprise_insee_client: ApiEntrepriseInseeRepository;
  api_insee_client: { findBySiren: FindUniteLegaleBySirenHandler };
  api_registre_national_entreprises_client: {
    findPouvoirsBySiren: FindPouvoirsBySirenHandler;
  };
  pg: Pool;
}) {
  return {
    client: {
      api_entreprise: {
        infogreffe: api_entreprise_infogreffe_client,
        insee: api_entreprise_insee_client,
      },
      insee: api_insee_client,
      rne: api_registre_national_entreprises_client,
    },
    repository: {
      email_domains: {
        addDomain: addDomainFactory({ pg }),
        deleteEmailDomainsByVerificationTypes:
          deleteEmailDomainsByVerificationTypesFactory({ pg }),
        findEmailDomainsByOrganizationId:
          findEmailDomainsByOrganizationIdFactory({ pg }),
      },
      organizations: {
        findById: findOrganizationByIdFactory({ pg }),
        findByUserId: findByUserIdFactory({ pg }),
        getUsers: getUsersByOrganizationFactory({ pg }),
      },
      users_organizations: {
        update: updateUserOrganizationLinkFactory({ pg }),
      },
      users: {
        create: createUserFactory({ pg }),
        findByEmail: findByEmailFactory({ pg }),
        findById: findUserByIdFactory({ pg }),
        getById: getByIdFactory({ pg }),
        getFranceConnectUserInfo: getFranceConnectUserInfoFactory({ pg }),
        update: updateUserFactory({ pg }),
        upsetFranceconnectUserinfo: upsertFranceconnectUserinfoFactory({ pg }),
      },
    },
  };
}
export type Context = ReturnType<typeof createContext>;
