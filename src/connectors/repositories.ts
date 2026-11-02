//

import type { ApiEntrepriseClient } from "@proconnect-gouv/proconnect.api_entreprise/api";
import { getEmailDomain } from "@proconnect-gouv/proconnect.core/services/email";
import type { IdentiteDatabase } from "@proconnect-gouv/proconnect.identite.runtime";
import {
  ModerationStatusSchema,
  type AuthenticatorTransportFuture,
  type ModerationType,
} from "@proconnect-gouv/proconnect.identite/types";
import type { ApiInseeClient } from "@proconnect-gouv/proconnect.insee/api";
import type { ApiRegistreNationalEntreprisesClient } from "@proconnect-gouv/proconnect.registre_national_entreprises/api";
import {
  createAuthenticatorFactory,
  deleteAuthenticatorFactory,
  updateAuthenticatorFactory,
} from "../repositories/legacy/authenticator";
import type { DatabaseContext } from "../repositories/legacy/context";
import { addDomainFactory } from "../repositories/legacy/email-domain";
import { findFranceconnectUserinfoFactory } from "../repositories/legacy/franceconnect_userinfo";
import {
  deleteModerationFactory,
  findModerationByIdFactory,
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
  db,
  pg,
}: {
  api_entreprise_client: ApiEntrepriseClient;
  api_insee_client: ApiInseeClient;
  api_registre_national_entreprises_client: ApiRegistreNationalEntreprisesClient;
  db: IdentiteDatabase;
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
        find: async (user_id: number, serialized_credential_id: string) => {
          const authenticator = await db.query.authenticators.findFirst({
            columns: {
              counter: true,
              credential_id: true,
              credential_public_key: true,
              display_name: true,
              transports: true,
              usage_count: true,
            },
            where: (table, { and, eq }) =>
              and(
                eq(table.user_id, user_id),
                eq(table.credential_id, serialized_credential_id),
              ),
          });

          return (
            authenticator && {
              ...authenticator,
              transports: (authenticator.transports ?? undefined) as
                | AuthenticatorTransportFuture[]
                | undefined,
            }
          );
        },
        findByUserId: async (user_id: number) => {
          const authenticators = await db.query.authenticators.findMany({
            columns: {
              created_at: true,
              credential_id: true,
              display_name: true,
              last_used_at: true,
              transports: true,
              usage_count: true,
              user_verified: true,
            },
            where: (table, { eq }) => eq(table.user_id, user_id),
          });

          return authenticators.map((authenticator) => ({
            ...authenticator,
            transports: (authenticator.transports ?? undefined) as
              | AuthenticatorTransportFuture[]
              | undefined,
          }));
        },
        update: updateAuthenticatorFactory({ pg }),
      },
      email_deliverability_whitelist: {
        findEmailInDeliverabilityWhiteList: (email: string) =>
          db.query.email_deliverability_whitelist.findFirst({
            columns: { email_domain: true },
            where: (table, { eq }) =>
              eq(table.email_domain, getEmailDomain(email)),
          }),
      },
      email_domains: {
        addDomain: addDomainFactory({ pg }),
        findEmailDomainsByOrganizationId: (organization_id: number) =>
          db.query.email_domains.findMany({
            columns: { domain: true, verification_type: true },
            where: (table, { eq }) =>
              eq(table.organization_id, organization_id),
          }),
      },
      moderations: {
        delete: deleteModerationFactory({ pg }),
        findById: findModerationByIdFactory({ pg }),
        findPending: ({
          user_id,
          organization_id,
          type,
        }: {
          user_id: number;
          organization_id: number;
          type: ModerationType;
        }) =>
          db.query.moderations.findFirst({
            columns: { id: true },
            where: (table, { and, eq, isNull }) =>
              and(
                eq(table.user_id, user_id),
                eq(table.organization_id, organization_id),
                eq(table.type, type),
                isNull(table.moderated_at),
              ),
          }),
        findRejected: ({
          user_id,
          organization_id,
          type,
        }: {
          user_id: number;
          organization_id: number;
          type: ModerationType;
        }) =>
          db.query.moderations.findFirst({
            columns: { id: true },
            where: (table, { and, eq, isNotNull }) =>
              and(
                eq(table.user_id, user_id),
                eq(table.organization_id, organization_id),
                eq(table.type, type),
                isNotNull(table.moderated_at),
                eq(table.status, ModerationStatusSchema.enum.rejected),
              ),
          }),
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
