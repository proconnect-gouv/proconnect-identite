//

import type { ApiEntrepriseClient } from "@proconnect-gouv/proconnect.api_entreprise/api";
import type { ApiInseeClient } from "@proconnect-gouv/proconnect.insee/api";
import type { ApiRegistreNationalEntreprisesClient } from "@proconnect-gouv/proconnect.registre_national_entreprises/api";
import {
  createAuthenticatorFactory,
  deleteAuthenticatorFactory,
  findAuthenticatorFactory,
  findAuthenticatorsByUserIdFactory,
  updateAuthenticatorFactory,
} from "../repositories/legacy/authenticator";
import type { DatabaseContext } from "../repositories/legacy/context";
import { findEmailInDeliverabilityWhiteListFactory } from "../repositories/legacy/email-deliverability-whitelist";
import {
  addDomainFactory,
  findEmailDomainsByOrganizationIdFactory,
} from "../repositories/legacy/email-domain";
import { findFranceconnectUserinfoFactory } from "../repositories/legacy/franceconnect_userinfo";
import {
  deleteModerationFactory,
  findModerationByIdFactory,
  findPendingModerationFactory,
  findRejectedModerationFactory,
  getModerationByIdFactory,
  reopenModerationFactory,
} from "../repositories/legacy/moderation";
import {
  deleteOfficialContactEmailVerificationFactory,
  findOfficialContactEmailVerificationFactory,
  upsertOfficialContactEmailVerificationFactory,
} from "../repositories/legacy/official-contact-email-verification";
import {
  findByClientIdFactory,
  upsertAuthorizationRequestFactory,
} from "../repositories/legacy/oidc-client";
import {
  findBySiretFactory,
  findByUserIdFactory,
  findOrganizationByIdFactory,
  findPendingByUserIdFactory,
  getOrganizationByIdFactory,
  upsertFactory,
} from "../repositories/legacy/organization";
import {
  createRecoveryWordsFactory,
  deleteRecoveryWordsByUserIdFactory,
  findRecoveryWordsByUserIdFactory,
} from "../repositories/legacy/recovery-words";
import {
  createUserFactory,
  findByEmailFactory,
  findByMagicLinkTokenFactory,
  findByResetPasswordTokenFactory,
  findByIdFactory as findUserByIdFactory,
  getByIdFactory,
  updateUserFactory,
} from "../repositories/legacy/user";
import {
  findUserOrganizationFactory,
  getUserOrganizationFactory,
} from "../repositories/legacy/user_organisation";

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
} & DatabaseContext) {
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
        find: findUserOrganizationFactory({ pg }),
        get: getUserOrganizationFactory({ pg }),
      },
      users: {
        create: createUserFactory({ pg }),
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
