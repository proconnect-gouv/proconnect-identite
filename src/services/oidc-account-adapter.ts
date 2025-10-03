//

import {
  UserClaimsSchema,
  type UserClaims,
} from "@proconnect-gouv/proconnect.identite/types";
import * as Sentry from "@sentry/node";
import { to } from "await-to-js";
import { isEmpty, omitBy } from "lodash-es";
import type { FindAccount } from "oidc-provider";
import { findByUserId as getUsersOrganizations } from "../repositories/organization/getters";
import { getSelectedOrganizationId } from "../repositories/redis/selected-organization";
import { findById as findUserById } from "../repositories/user";
import { logger } from "./log";
import { mustReturnOneOrganizationInPayload } from "./must-return-one-organization-in-payload";
import { isCommune, isPublicService } from "./organization";

export const findAccount: FindAccount = async (_ctx, sub) => {
  const user = await findUserById(parseInt(sub, 10));

  if (isEmpty(user)) {
    return;
  }

  return {
    accountId: sub,
    async claims(_use: any, scope: string) {
      const {
        id,
        email,
        email_verified,
        updated_at,
        given_name,
        family_name,
        phone_number,
        job,
      } = user;

      const userClaims = {
        email_verified,
        email,
        family_name,
        given_name,
        job,
        phone_number_verified: false,
        phone_number,
        sub: id.toString(), // it is essential to always return a sub claim
        uid: id.toString(), // for ProConnect Federation use only
        updated_at,
        usual_name: family_name,
      };
      const personalClaims: UserClaims = UserClaimsSchema.parse(
        omitBy(
          userClaims,
          (value) =>
            // NOTE(douglasduteil): a Claim SHOULD NOT be present with a null or empty string value
            // \see https://openid.net/specs/openid-connect-core-1_0.html#UserInfoResponse
            value === null || value === "",
        ),
      );

      const organizations = await getUsersOrganizations(id);
      if (mustReturnOneOrganizationInPayload(scope)) {
        const [selectedOrganizationIdErr, selectedOrganizationId] = await to(
          getSelectedOrganizationId(id),
        );

        if (selectedOrganizationIdErr) {
          // This Error will be silently swallowed by oidc-provider.
          // We add additional logs to keep traces.
          logger.error(selectedOrganizationIdErr);
          Sentry.captureException(selectedOrganizationIdErr);
          // this will result in a 400 Bad Request
          // Response: {
          //    "error": "invalid_grant",
          //    "error_description": "grant request is invalid"
          // }
          throw selectedOrganizationIdErr;
        }

        const organization = organizations.find(
          ({ id }) => id === selectedOrganizationId,
        );

        if (isEmpty(organization)) {
          // see comments on above error management
          const err = Error("organization should be set");
          logger.error(err);
          Sentry.captureException(err);
          throw err;
        }

        return {
          ...personalClaims,
          label: organization.cached_libelle,
          siret: organization.siret,
          is_commune: isCommune(organization),
          is_external: organization.is_external,
          is_service_public: isPublicService(organization),
          is_public_service: isPublicService(organization),
        };
      } else {
        return {
          ...personalClaims,
          organizations: organizations.map((organization) => {
            const {
              id,
              siret,
              is_external,
              cached_libelle: label,
            } = organization;

            return {
              id,
              siret,
              is_external,
              label,
              is_commune: isCommune(organization),
              is_service_public: isPublicService(organization),
              is_public_service: isPublicService(organization),
            };
          }),
        };
      }
    },
  };
};
