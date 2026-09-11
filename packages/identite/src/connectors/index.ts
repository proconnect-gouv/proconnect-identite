//

import {
  createAuthenticatorFactory,
  deleteAuthenticatorFactory,
  findAuthenticatorFactory,
  findAuthenticatorsByUserIdFactory,
  updateAuthenticatorFactory,
} from "#src/repositories/authenticator";
import { findEmailInDeliverabilityWhiteListFactory } from "#src/repositories/email-deliverability-whitelist";
import {
  addDomainFactory,
  deleteEmailDomainsByVerificationTypesFactory,
  findEmailDomainsByOrganizationIdFactory,
} from "#src/repositories/email-domain";
import {
  deleteFranceconnectUserinfoFactory,
  findFranceconnectUserinfoFactory,
  upsertFranceconnectUserinfoFactory,
} from "#src/repositories/franceconnect_userinfo";
import {
  createModerationFactory,
  deleteModerationFactory,
  findModerationByIdFactory,
  findPendingModerationFactory,
  findRejectedModerationFactory,
  getModerationByIdFactory,
  reopenModerationFactory,
} from "#src/repositories/moderation";
import {
  deleteOfficialContactEmailVerificationFactory,
  findOfficialContactEmailVerificationFactory,
  upsertOfficialContactEmailVerificationFactory,
} from "#src/repositories/official-contact-email-verification";
import {
  addConnectionFactory,
  findByClientIdFactory,
} from "#src/repositories/oidc-client";
import {
  findBySiretFactory,
  findByUserIdFactory,
  findByVerifiedEmailDomainFactory,
  findOrganizationByIdFactory,
  findPendingByUserIdFactory,
  findUsersByOrganizationFactory,
  getOrganizationByIdFactory,
  upsertFactory,
} from "#src/repositories/organization";
import {
  createUserFactory,
  deleteUserFactory,
  findByEmailFactory,
  findByMagicLinkTokenFactory,
  findByResetPasswordTokenFactory,
  findByIdFactory as findUserByIdFactory,
  getByIdFactory,
  updateUserFactory,
} from "#src/repositories/user";
import {
  createUserOrganizationFactory,
  deleteUserOrganizationFactory,
  findUserOrganizationFactory,
  updateUserOrganizationFactory,
} from "#src/repositories/user_organisation";
import type { ApiEntrepriseClient } from "@proconnect-gouv/proconnect.api_entreprise/api";
import type { ApiInseeClient } from "@proconnect-gouv/proconnect.insee/api";
import type { ApiRegistreNationalEntreprisesClient } from "@proconnect-gouv/proconnect.registre_national_entreprises/api";
import { type Pool } from "pg";

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
  pg: Pool;
}) {
  return {
    client: {
      api_entreprise: api_entreprise_client,
      insee: api_insee_client,
      rne: api_registre_national_entreprises_client,
    },
    repository: {
      authenticators: {
        create: createAuthenticatorFactory({ pg }),
        delete: deleteAuthenticatorFactory({ pg }),
        find: findAuthenticatorFactory({ pg }),
        findByUserId: findAuthenticatorsByUserIdFactory({ pg }),
        update: updateAuthenticatorFactory({ pg }),
      },
      email_deliverability_whitelist: {
        findEmailInDeliverabilityWhiteList:
          findEmailInDeliverabilityWhiteListFactory({ pg }),
      },
      email_domains: {
        addDomain: addDomainFactory({ pg }),
        deleteEmailDomainsByVerificationTypes:
          deleteEmailDomainsByVerificationTypesFactory({ pg }),
        findEmailDomainsByOrganizationId:
          findEmailDomainsByOrganizationIdFactory({ pg }),
      },
      moderations: {
        create: createModerationFactory({ pg }),
        delete: deleteModerationFactory({ pg }),
        findById: findModerationByIdFactory({ pg }),
        findPending: findPendingModerationFactory({ pg }),
        findRejected: findRejectedModerationFactory({ pg }),
        getById: getModerationByIdFactory({ pg }),
        reopen: reopenModerationFactory({ pg }),
      },
      official_contact_email_verifications: {
        delete: deleteOfficialContactEmailVerificationFactory({ pg }),
        find: findOfficialContactEmailVerificationFactory({ pg }),
        upsert: upsertOfficialContactEmailVerificationFactory({ pg }),
      },
      oidc_clients: {
        addConnection: addConnectionFactory({ pg }),
        findByClientId: findByClientIdFactory({ pg }),
      },
      organizations: {
        findById: findOrganizationByIdFactory({ pg }),
        findBySiret: findBySiretFactory({ pg }),
        findByUserId: findByUserIdFactory({ pg }),
        findByVerifiedEmailDomain: findByVerifiedEmailDomainFactory({ pg }),
        findPendingByUserId: findPendingByUserIdFactory({ pg }),
        findUsers: findUsersByOrganizationFactory({ pg }),
        getById: getOrganizationByIdFactory({ pg }),
        upsert: upsertFactory({ pg }),
      },
      users_organizations: {
        create: createUserOrganizationFactory({ pg }),
        delete: deleteUserOrganizationFactory({ pg }),
        find: findUserOrganizationFactory({ pg }),
        update: updateUserOrganizationFactory({ pg }),
      },
      users: {
        create: createUserFactory({ pg }),
        delete: deleteUserFactory({ pg }),
        findByEmail: findByEmailFactory({ pg }),
        findById: findUserByIdFactory({ pg }),
        findByMagicLinkToken: findByMagicLinkTokenFactory({ pg }),
        findByResetPasswordToken: findByResetPasswordTokenFactory({ pg }),
        getById: getByIdFactory({ pg }),
        update: updateUserFactory({ pg }),
      },
      franceconnect_userinfo: {
        delete: deleteFranceconnectUserinfoFactory({ pg }),
        find: findFranceconnectUserinfoFactory({ pg }),
        upsert: upsertFranceconnectUserinfoFactory({ pg }),
      },
    },
  };
}
export type Context = ReturnType<typeof createContext>;
