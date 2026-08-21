//

import type { ApiEntrepriseClient } from "@proconnect-gouv/proconnect.api_entreprise/api";
import type { ApiInseeClient } from "@proconnect-gouv/proconnect.insee/api";
import type { ApiRegistreNationalEntreprisesClient } from "@proconnect-gouv/proconnect.registre_national_entreprises/api";
import { type Pool } from "pg";
import { createAuthenticatorFactory } from "../repositories/authenticator/create-authenticator.js";
import { deleteAuthenticatorFactory } from "../repositories/authenticator/delete-authenticator.js";
import { findAuthenticatorFactory } from "../repositories/authenticator/find-authenticator.js";
import { getAuthenticatorsByUserIdFactory } from "../repositories/authenticator/get-authenticators-by-user-id.js";
import { updateAuthenticatorFactory } from "../repositories/authenticator/update-authenticator.js";
import { findEmailInDeliverabilityWhiteListFactory } from "../repositories/email-deliverability-whitelist/find-email-in-deliverability-white-list.js";
import { addDomainFactory } from "../repositories/email-domain/add-domain.js";
import { deleteEmailDomainsByVerificationTypesFactory } from "../repositories/email-domain/delete-email-domains-by-verification-types.js";
import { findEmailDomainsByOrganizationIdFactory } from "../repositories/email-domain/find-email-domains-by-organization-id.js";
import { createModerationFactory } from "../repositories/moderation/create-moderation.js";
import { deleteModerationFactory } from "../repositories/moderation/delete-moderation.js";
import { findModerationByIdFactory } from "../repositories/moderation/find-moderation-by-id.js";
import { findPendingModerationFactory } from "../repositories/moderation/find-pending-moderation.js";
import { findRejectedModerationFactory } from "../repositories/moderation/find-rejected-moderation.js";
import { getModerationByIdFactory } from "../repositories/moderation/get-moderation-by-id.js";
import { reopenModerationFactory } from "../repositories/moderation/reopen-moderation.js";
import { addConnectionFactory } from "../repositories/oidc-client/add-connection.js";
import { findByClientIdFactory } from "../repositories/oidc-client/find-by-client-id.js";
import { deleteUserOrganizationFactory } from "../repositories/organization/delete-user-organization.js";
import { findByIdFactory as findOrganizationByIdFactory } from "../repositories/organization/find-by-id.js";
import { findBySiretFactory } from "../repositories/organization/find-by-siret.js";
import { findByUserIdFactory } from "../repositories/organization/find-by-user-id.js";
import { findByVerifiedEmailDomainFactory } from "../repositories/organization/find-by-verified-email-domain.js";
import { findPendingByUserIdFactory } from "../repositories/organization/find-pending-by-user-id.js";
import { getUserOrganizationLinkFactory } from "../repositories/organization/get-user-organization-link.js";
import { getUsersByOrganizationFactory } from "../repositories/organization/get-users-by-organization.js";
import { linkUserToOrganizationFactory } from "../repositories/organization/link-user-to-organization.js";
import { upsertFactory } from "../repositories/organization/upsert.js";
import { createUserFactory } from "../repositories/user/create.js";
import { deleteUserFactory } from "../repositories/user/delete.js";
import { findByEmailFactory } from "../repositories/user/find-by-email.js";
import { findByIdFactory as findUserByIdFactory } from "../repositories/user/find-by-id.js";
import { findByMagicLinkTokenFactory } from "../repositories/user/find-by-magic-link-token.js";
import { findByResetPasswordTokenFactory } from "../repositories/user/find-by-reset-password-token.js";
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
