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
  findEmailDomainsByOrganizationIdFactory,
} from "#src/repositories/email-domain";
import { findFranceconnectUserinfoFactory } from "#src/repositories/franceconnect_userinfo";
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
  findByClientIdFactory,
  upsertAuthorizationRequestFactory,
} from "#src/repositories/oidc-client";
import {
  findBySiretFactory,
  findByUserIdFactory,
  findByVerifiedEmailDomainFactory,
  findOrganizationByIdFactory,
  findPendingByUserIdFactory,
  getOrganizationByIdFactory,
  upsertFactory,
} from "#src/repositories/organization";
import {
  createRecoveryWordsFactory,
  deleteRecoveryWordsByUserIdFactory,
  findRecoveryWordsByUserIdFactory,
} from "#src/repositories/recovery-words";
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
  findUserOrganizationFactory,
  getUserOrganizationFactory,
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
        findByClientId: findByClientIdFactory({ pg }),
        upsertAuthorizationRequest: upsertAuthorizationRequestFactory({ pg }),
      },
      organizations: {
        findById: findOrganizationByIdFactory({ pg }),
        findBySiret: findBySiretFactory({ pg }),
        findByUserId: findByUserIdFactory({ pg }),
        findByVerifiedEmailDomain: findByVerifiedEmailDomainFactory({ pg }),
        findPendingByUserId: findPendingByUserIdFactory({ pg }),
        getById: getOrganizationByIdFactory({ pg }),
        upsert: upsertFactory({ pg }),
      },
      recovery_words: {
        create: createRecoveryWordsFactory({ pg }),
        deleteByUserId: deleteRecoveryWordsByUserIdFactory({ pg }),
        findByUserId: findRecoveryWordsByUserIdFactory({ pg }),
      },
      users_organizations: {
        create: createUserOrganizationFactory({ pg }),
        find: findUserOrganizationFactory({ pg }),
        get: getUserOrganizationFactory({ pg }),
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
        find: findFranceconnectUserinfoFactory({ pg }),
      },
    },
  };
}
export type Context = ReturnType<typeof createContext>;
