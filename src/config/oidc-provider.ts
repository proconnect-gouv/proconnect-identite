//

import * as Sentry from "@sentry/node";
import Provider, { errors } from "oidc-provider";
import { logger } from "../services/log";
import { renderWithEjsLayout } from "../services/renderer";
import { connectionCountMiddleware } from "./../middlewares/connection-count";
import { oidcProviderAdapterFactory } from "./../repositories/redis/oidc-provider";
import {
  FEATURE_USE_SECURE_COOKIES,
  HOST,
  JWKS,
  SESSION_COOKIE_SECRET,
  SESSION_MAX_AGE_IN_SECONDS,
} from "./env";
import { oidcProviderConfiguration } from "./oidc-provider-configuration";

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
