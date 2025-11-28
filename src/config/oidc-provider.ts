//

import * as Sentry from "@sentry/node";
import type { Request } from "express";
import Provider, { errors, type Configuration } from "oidc-provider";
import { destroyAuthenticatedSession } from "../managers/session/authenticated";
import epochTime from "../services/epoch-time";
import { logger } from "../services/log";
import { findAccount } from "../services/oidc-account-adapter";
import policy from "../services/oidc-policy";
import { oidcProviderAdapterFactory } from "../services/oidc-provider-adapter";
import { renderWithEjsLayout } from "../services/renderer";
import { connectionCountMiddleware } from "./../middlewares/connection-count";
import {
  ACR_VALUE_FOR_CERTIFICATION_DIRIGEANT,
  ACR_VALUE_FOR_IAL1_AAL1,
  ACR_VALUE_FOR_IAL1_AAL2,
  ACR_VALUE_FOR_IAL2_AAL1,
  ACR_VALUE_FOR_IAL2_AAL2,
  FEATURE_USE_SECURE_COOKIES,
  HOST,
  JWKS,
  SESSION_COOKIE_SECRET,
  SESSION_MAX_AGE_IN_SECONDS,
} from "./env";

//

export async function createOidcProvider() {
  const oidcProvider = new Provider(`${HOST}`, {
    adapter: oidcProviderAdapterFactory,
    jwks: JWKS,
    async renderError(ctx, { error, error_description }, err) {
      logger.error(err);
      if (
        !(
          err instanceof errors.InvalidClient ||
          err instanceof errors.InvalidRedirectUri ||
          err instanceof errors.InvalidRequest ||
          err instanceof errors.InvalidRequestUri
        )
      ) {
        Sentry.withScope((scope) => {
          scope.setSDKProcessingMetadata({ request: ctx.request });
          scope.captureException(err);
        });
      }

      ctx.type = "html";
      ctx.body = await renderWithEjsLayout("error", {
        error_code:
          err instanceof errors.OIDCProviderError ? err.statusCode : err,
        error_message: `${error}: ${error_description}`,
      });
    },
    cookies: {
      names: {
        session: "oidc.session",
        interaction: "oidc.interaction",
        resume: "oidc.interaction_resume",
        state: "oidc.state",
      },
      long: {
        overwrite: true,
        signed: true,
        secure: FEATURE_USE_SECURE_COOKIES,
        sameSite: "lax",
      },
      short: {
        overwrite: true,
        signed: true,
        secure: FEATURE_USE_SECURE_COOKIES,
        sameSite: "lax",
      },
      keys: SESSION_COOKIE_SECRET,
    },
    ...oidcProviderConfiguration({
      sessionTtlInSeconds: SESSION_MAX_AGE_IN_SECONDS,
    }),
  });
  oidcProvider.proxy = true;
  oidcProvider.use(connectionCountMiddleware);

  return oidcProvider;
}

//

export const oidcProviderConfiguration = ({
  sessionTtlInSeconds = 14 * 24 * 60 * 60,
  shortTokenTtlInSeconds = 10 * 60,
  tokenTtlInSeconds = 60 * 60,
}): Configuration => ({
  acrValues: [
    "eidas1", // legacy acr value
    ACR_VALUE_FOR_IAL1_AAL1,
    ACR_VALUE_FOR_IAL1_AAL2,
    ACR_VALUE_FOR_IAL2_AAL1,
    ACR_VALUE_FOR_IAL2_AAL2,
    ACR_VALUE_FOR_CERTIFICATION_DIRIGEANT,
  ],
  claims: {
    amr: null,
    // claims definitions can be found here: https://openid.net/specs/openid-connect-core-1_0.html#ScopeClaims
    openid: ["sub"],
    email: ["email", "email_verified"],
    profile: ["family_name", "given_name", "updated_at", "job"],
    phone: ["phone_number", "phone_number_verified"],
    organization: [
      "label",
      "siret",
      "is_commune",
      "is_external",
      "is_public_service",
      // This claim will be deprecated
      "is_service_public",
    ],
    // This scope will be deprecated
    organizations: ["organizations"],
    // Additional scopes for ProConnect Federation use only
    uid: ["uid"],
    given_name: ["given_name"],
    usual_name: ["usual_name"],
    siret: ["siret"],
    is_public_service: ["is_public_service"],
    // This scope will be deprecated
    is_service_public: ["is_service_public"],
  },
  extraParams: ["sp_name", "siret_hint"],
  features: {
    claimsParameter: { enabled: true },
    devInteractions: { enabled: false },
    encryption: { enabled: true },
    introspection: { enabled: true },
    jwtUserinfo: { enabled: true },
    rpInitiatedLogout: {
      enabled: true,
      // @ts-ignore
      logoutSource: async (ctx, form) => {
        await destroyAuthenticatedSession(ctx.req as Request);
        const csrfToken = /name="xsrf" value="([a-f0-9]*)"/.exec(form)![1];

        ctx.type = "html";
        ctx.body = await renderWithEjsLayout("autosubmit-form", {
          csrfToken,
          actionLabel: "Déconnexion...",
          actionPath: "/oauth/logout/confirm",
          inputName: "logout",
          inputValue: "non-empty-value",
        });
      },
      // @ts-ignore
      postLogoutSuccessSource: async (ctx) => {
        // If ctx.oidc.session is null (ie. koa session has ended or expired), logoutSource is not called.
        // If ctx.oidc.params.client_id is not null (ie. logout initiated from Relying Party), postLogoutSuccessSource is not called
        // Make sure the user is logged out from express.
        await destroyAuthenticatedSession(ctx.req as Request);
        ctx.redirect("/users/start-sign-in/?notification=logout_success");
      },
    },
  },
  findAccount,
  interactions: {
    policy,
  },
  loadExistingGrant: async (ctx) => {
    // We want to skip the consent
    // inspired from https://github.com/panva/node-oidc-provider/blob/main/recipes/skip_consent.md
    // We updated the function to ensure it always return a grant.
    // As a consequence, the consent prompt should never be requested afterward.
    // The grant id never comes from consent results, so we simplified this line
    if (!ctx.oidc.session || !ctx.oidc.client || !ctx.oidc.params) {
      return undefined;
    }
    const oidcContextParams = ctx.oidc.params as OIDCContextParams;
    const grantId = ctx.oidc.session.grantIdFor(ctx.oidc.client.clientId);

    let grant;

    if (grantId) {
      grant = await ctx.oidc.provider.Grant.find(grantId);
      // if the grant has expired, the grant can be undefined at this point.
      if (grant) {
        // Keep grant expiry aligned with session expiry to prevent consent
        // prompt being requested when the grant is about to expire.
        // The original code is overkill as session length is extended on every
        // interaction.
        grant.exp = epochTime() + sessionTtlInSeconds;
        await grant.save();
      }
    }

    if (!grant) {
      grant = new ctx.oidc.provider.Grant({
        clientId: ctx.oidc.client.clientId,
        accountId: ctx.oidc.session.accountId,
      });
    }

    // event existing grant should be updated, as requested scopes might
    // be different
    grant.addOIDCScope(oidcContextParams.scope);
    grant.addOIDCClaims(Array.from(ctx.oidc.requestParamClaims || []));
    await grant.save();
    return grant;
  },
  pkce: { required: () => false },
  responseTypes: ["code"],
  routes: {
    authorization: "/authorize",
    token: "/token",
    userinfo: "/userinfo",
    end_session: "/logout",
    introspection: "/token/introspection",
  },
  scopes: [
    "openid",
    "email",
    "profile",
    "organization",
    // This scope will be deprecated
    "organizations",
    // Additional scopes for ProConnect Federation use only
    "uid",
    "given_name",
    "usual_name",
    "siret",
    "is_public_service",
    // This scope will be deprecated
    "is_service_public",
  ],
  subjectTypes: ["public"],
  ttl: {
    // Set ttl to default value to remove warning in console
    AccessToken: tokenTtlInSeconds,
    AuthorizationCode: shortTokenTtlInSeconds,
    IdToken: tokenTtlInSeconds,
    Interaction: tokenTtlInSeconds,
    // Grant and Session ttl should be the same
    // see loadExistingGrant for more info
    Grant: sessionTtlInSeconds,
    RefreshToken: sessionTtlInSeconds,
    Session: sessionTtlInSeconds,
  },
});
