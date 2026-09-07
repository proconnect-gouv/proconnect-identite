//

import {
  createAuthenticatorFactory,
  deleteAuthenticatorFactory,
  findAuthenticatorFactory,
  getAuthenticatorsByUserIdFactory,
  updateAuthenticatorFactory,
} from "#src/repositories/authenticator";
import { findEmailInDeliverabilityWhiteListFactory } from "#src/repositories/email-deliverability-whitelist";
import {
  addDomainFactory,
  deleteEmailDomainsByVerificationTypesFactory,
  findEmailDomainsByOrganizationIdFactory,
} from "#src/repositories/email-domain";
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
  deleteUserOrganizationFactory,
  findBySiretFactory,
  findByUserIdFactory,
  findByVerifiedEmailDomainFactory,
  findOrganizationByIdFactory,
  findPendingByUserIdFactory,
  getOrganizationByIdFactory,
  getUserOrganizationLinkFactory,
  getUsersByOrganizationFactory,
  linkUserToOrganizationFactory,
  upsertFactory,
} from "#src/repositories/organization";
import {
  createUserFactory,
  deleteFranceConnectUserInfoFactory,
  deleteUserFactory,
  findByEmailFactory,
  findByMagicLinkTokenFactory,
  findByResetPasswordTokenFactory,
  findByIdFactory as findUserByIdFactory,
  getByIdFactory,
  getFranceConnectUserInfoFactory,
  updateUserFactory,
  updateUserOrganizationLinkFactory,
  upsertFranceconnectUserinfoFactory,
} from "#src/repositories/user";
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
        createAuthenticator: createAuthenticatorFactory({ pg }),
        deleteAuthenticator: deleteAuthenticatorFactory({ pg }),
        findAuthenticator: findAuthenticatorFactory({ pg }),
        getAuthenticatorsByUserId: getAuthenticatorsByUserIdFactory({ pg }),
        updateAuthenticator: updateAuthenticatorFactory({ pg }),
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
        deleteUserOrganization: deleteUserOrganizationFactory({ pg }),
        findById: findOrganizationByIdFactory({ pg }),
        findBySiret: findBySiretFactory({ pg }),
        findByUserId: findByUserIdFactory({ pg }),
        findByVerifiedEmailDomain: findByVerifiedEmailDomainFactory({ pg }),
        findPendingByUserId: findPendingByUserIdFactory({ pg }),
        getById: getOrganizationByIdFactory({ pg }),
        getUserOrganizationLink: getUserOrganizationLinkFactory({ pg }),
        getUsers: getUsersByOrganizationFactory({ pg }),
        linkUserToOrganization: linkUserToOrganizationFactory({ pg }),
        upsert: upsertFactory({ pg }),
      },
      users_organizations: {
        update: updateUserOrganizationLinkFactory({ pg }),
      },
      users: {
        create: createUserFactory({ pg }),
        delete: deleteUserFactory({ pg }),
        deleteFranceConnectUserInfo: deleteFranceConnectUserInfoFactory({ pg }),
        findByEmail: findByEmailFactory({ pg }),
        findById: findUserByIdFactory({ pg }),
        findByMagicLinkToken: findByMagicLinkTokenFactory({ pg }),
        findByResetPasswordToken: findByResetPasswordTokenFactory({ pg }),
        getById: getByIdFactory({ pg }),
        getFranceConnectUserInfo: getFranceConnectUserInfoFactory({ pg }),
        update: updateUserFactory({ pg }),
        upsetFranceconnectUserinfo: upsertFranceconnectUserinfoFactory({ pg }),
      },
    },
  };
}
export type Context = ReturnType<typeof createContext>;
