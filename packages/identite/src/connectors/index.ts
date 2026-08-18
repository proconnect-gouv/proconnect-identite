//

import type { Queryable } from "#src/types";
import type { ApiEntrepriseClient } from "@proconnect-gouv/proconnect.api_entreprise/api";
import type { ApiInseeClient } from "@proconnect-gouv/proconnect.insee/api";
import type { ApiRegistreNationalEntreprisesClient } from "@proconnect-gouv/proconnect.registre_national_entreprises/api";
import { createActivityFactory } from "../repositories/activity/create.js";
import { addDomainFactory } from "../repositories/email-domain/add-domain.js";
import { deleteEmailDomainsByVerificationTypesFactory } from "../repositories/email-domain/delete-email-domains-by-verification-types.js";
import { findEmailDomainsByOrganizationIdFactory } from "../repositories/email-domain/find-email-domains-by-organization-id.js";
import { deleteModerationFactory } from "../repositories/moderation/delete-moderation.js";
import { reopenModerationFactory } from "../repositories/moderation/reopen-moderation.js";
import { findByIdFactory as findOrganizationByIdFactory } from "../repositories/organization/find-by-id.js";
import { findByUserIdFactory } from "../repositories/organization/find-by-user-id.js";
import { getUsersByOrganizationFactory } from "../repositories/organization/get-users-by-organization.js";
import { createUserFactory } from "../repositories/user/create.js";
import { deleteUserFactory } from "../repositories/user/delete.js";
import { findByEmailFactory } from "../repositories/user/find-by-email.js";
import { findByIdFactory as findUserByIdFactory } from "../repositories/user/find-by-id.js";
import { getByIdFactory } from "../repositories/user/get-by-id.js";
import { getFranceConnectUserInfoFactory } from "../repositories/user/get-franceconnect-user-info.js";
import { updateUserOrganizationLinkFactory } from "../repositories/user/update-user-organization-link.js";
import { updateUserFactory } from "../repositories/user/update.js";
import { upsertFranceconnectUserinfoFactory } from "../repositories/user/upsert-franceconnect-userinfo.js";

//

export function createContext({
  api_entreprise_client,
  api_insee_client,
  api_registre_national_entreprises_client,
  pg,
}: {
  api_entreprise_client: ApiEntrepriseClient;
  api_insee_client: ApiInseeClient;
  api_registre_national_entreprises_client: ApiRegistreNationalEntreprisesClient;
  pg: Queryable;
}) {
  return {
    createChild: ({ pg: child_pg }: { pg: Queryable }) =>
      createContext({
        api_entreprise_client,
        api_insee_client,
        api_registre_national_entreprises_client,
        pg: child_pg,
      }),
    client: {
      api_entreprise: api_entreprise_client,
      insee: api_insee_client,
      rne: api_registre_national_entreprises_client,
    },
    repository: {
      activity: createActivityFactory({ pg }),
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
      moderations: {
        delete: deleteModerationFactory({ pg }),
        reopen: reopenModerationFactory({ pg }),
      },
      users_organizations: {
        update: updateUserOrganizationLinkFactory({ pg }),
      },
      users: {
        create: createUserFactory({ pg }),
        delete: deleteUserFactory({ pg }),
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
