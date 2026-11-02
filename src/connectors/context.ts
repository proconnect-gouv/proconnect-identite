//

import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { createIdentiteRuntime } from "@proconnect-gouv/proconnect.identite.runtime";
import { drizzle } from "drizzle-orm/node-postgres";
import {
  createAuthenticatorFactory,
  deleteAuthenticatorFactory,
  findAuthenticatorFactory,
  findAuthenticatorsByUserIdFactory,
  updateAuthenticatorFactory,
} from "../repositories/authenticator";
import { findEmailInDeliverabilityWhiteListFactory } from "../repositories/email-deliverability-whitelist";
import {
  addDomainFactory,
  findEmailDomainsByOrganizationIdFactory,
} from "../repositories/email-domain";
import { findFranceconnectUserinfoFactory } from "../repositories/franceconnect_userinfo";
import {
  deleteModerationFactory,
  findModerationByIdFactory,
  findPendingModerationFactory,
  findRejectedModerationFactory,
  getModerationByIdFactory,
  reopenModerationFactory,
} from "../repositories/moderation";
import {
  deleteOfficialContactEmailVerificationFactory,
  findOfficialContactEmailVerificationFactory,
  upsertOfficialContactEmailVerificationFactory,
} from "../repositories/official-contact-email-verification";
import {
  findByClientIdFactory,
  upsertAuthorizationRequestFactory,
} from "../repositories/oidc-client";
import {
  findByUserIdFactory,
  findOrganizationByIdFactory,
  findOrganizationBySiret,
  findPendingByUserIdFactory,
  getOrganizationByIdFactory,
  upsertFactory,
} from "../repositories/organization";
import {
  createRecoveryWordsFactory,
  deleteRecoveryWordsByUserIdFactory,
  findRecoveryWordsByUserIdFactory,
} from "../repositories/recovery-words";
import {
  createUserFactory,
  findByEmailFactory,
  findByMagicLinkTokenFactory,
  findByResetPasswordTokenFactory,
  findByIdFactory,
  getByIdFactory,
  updateUserFactory,
} from "../repositories/user";
import {
  findUserOrganizationFactory,
  getUserOrganizationFactory,
} from "../repositories/user_organisation";
import { instrument } from "../services/log";
import { ApiEntrepriseClient } from "./api-entreprise";
import { ApiInseeClient } from "./api-insee";
import { ApiRegistreNationalEntreprisesClient } from "./api-rne";
import { getDatabaseConnection } from "./postgres";

//

export const db = drizzle(getDatabaseConnection(), { schema });

const database = { db };

export const context = {
  client: {
    api_entreprise: ApiEntrepriseClient,
    insee: ApiInseeClient,
    rne: ApiRegistreNationalEntreprisesClient,
  },
  repository: {
    authenticators: instrument("identite.repository.authenticators", {
      create: createAuthenticatorFactory(database),
      delete: deleteAuthenticatorFactory(database),
      find: findAuthenticatorFactory(database),
      findByUserId: findAuthenticatorsByUserIdFactory(database),
      update: updateAuthenticatorFactory(database),
    }),
    email_deliverability_whitelist: instrument(
      "identite.repository.email_deliverability_whitelist",
      {
        findEmailInDeliverabilityWhiteList:
          findEmailInDeliverabilityWhiteListFactory(database),
      },
    ),
    email_domains: instrument("identite.repository.email_domains", {
      addDomain: addDomainFactory(database),
      findEmailDomainsByOrganizationId:
        findEmailDomainsByOrganizationIdFactory(database),
    }),
    franceconnect_userinfo: instrument(
      "identite.repository.franceconnect_userinfo",
      {
        find: findFranceconnectUserinfoFactory(database),
      },
    ),
    moderations: instrument("identite.repository.moderations", {
      delete: deleteModerationFactory(database),
      findById: findModerationByIdFactory(database),
      findPending: findPendingModerationFactory(database),
      findRejected: findRejectedModerationFactory(database),
      getById: getModerationByIdFactory(database),
      reopen: reopenModerationFactory(database),
    }),
    official_contact_email_verifications: instrument(
      "identite.repository.official_contact_email_verifications",
      {
        delete: deleteOfficialContactEmailVerificationFactory(database),
        find: findOfficialContactEmailVerificationFactory(database),
        upsert: upsertOfficialContactEmailVerificationFactory(database),
      },
    ),
    oidc_clients: instrument("identite.repository.oidc_clients", {
      findByClientId: findByClientIdFactory(database),
      upsertAuthorizationRequest: upsertAuthorizationRequestFactory(database),
    }),
    organizations: instrument("identite.repository.organizations", {
      findById: findOrganizationByIdFactory(database),
      findBySiret: (siret: string) => findOrganizationBySiret(db, siret),
      findByUserId: findByUserIdFactory(database),
      findPendingByUserId: findPendingByUserIdFactory(database),
      getById: getOrganizationByIdFactory(database),
      upsert: upsertFactory(database),
    }),
    recovery_words: instrument("identite.repository.recovery_words", {
      create: createRecoveryWordsFactory(database),
      deleteByUserId: deleteRecoveryWordsByUserIdFactory(database),
      findByUserId: findRecoveryWordsByUserIdFactory(database),
    }),
    users: instrument("identite.repository.users", {
      create: createUserFactory(database),
      findByEmail: findByEmailFactory(database),
      findById: findByIdFactory(database),
      findByMagicLinkToken: findByMagicLinkTokenFactory(database),
      findByResetPasswordToken: findByResetPasswordTokenFactory(database),
      getById: getByIdFactory(database),
      update: updateUserFactory(database),
    }),
    users_organizations: instrument("identite.repository.users_organizations", {
      find: findUserOrganizationFactory(database),
      get: getUserOrganizationFactory(database),
    }),
  },
};

const runtimeUntraced = createIdentiteRuntime({
  app: "proconnect-identite",
  db,
});

export const runtime: typeof runtimeUntraced = {
  as(actor) {
    return instrument("identite.runtime", runtimeUntraced.as(actor));
  },
};
