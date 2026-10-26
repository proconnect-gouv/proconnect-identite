//

import {
  createOidcChecks,
  getFranceConnectRedirectUrlFactory,
} from "@proconnect-gouv/proconnect.identite/managers/franceconnect";
import { captureException, metrics } from "@sentry/node";
import { to } from "await-to-js";
import { type NextFunction, type Request, type Response } from "express";
import { AssertionError } from "node:assert";
import { z } from "zod";
import { FRANCECONNECT_SCOPES, HOST } from "../../config/env";
import {
  OidcError,
  OidcFranceConnectBackChannelError,
} from "../../config/errors";
import {
  getFranceConnectConfiguration,
  getFranceConnectLogoutRedirectUrl,
  getFranceConnectUser,
} from "../../connectors/franceconnect";
import {
  getUserFromAuthenticatedSession,
  updateUserInAuthenticatedSession,
} from "../../managers/session/authenticated";
import { FranceConnectOidcSessionSchema } from "../../managers/session/franceconnect";
import { updateFranceConnectUserInfo } from "../../managers/user";
import { csrfToken } from "../../middlewares/csrf-protection";
import getNotificationsFromRequest from "../../services/get-notifications-from-request";
import { logger } from "../../services/log";

//

export async function getFranceConnectController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const displayCertificationDirigeantContent =
      !!req.session.certificationDirigeantRequested;
    const pageTitle = displayCertificationDirigeantContent
      ? "Certification dirigeant"
      : "Vérifier votre identité";

    return res.render("user/franceconnect", {
      csrfToken: csrfToken(req),
      pageTitle,
      notifications: await getNotificationsFromRequest(req),
      displayCertificationDirigeantContent,
    });
  } catch (error) {
    next(error);
  }
}

export function getFranceConnectLoginCallbackMiddlewareFactory(
  exception_redirect_uri: string,
) {
  return async function getFranceConnectLoginCallbackMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const query = await z
      .union([
        z.object({
          error: z.string(),
          error_description: z.string().optional(),
        }),
        z.object({ code: z.string() }),
      ])
      .parseAsync(req.query);

    if ("error" in query) {
      if (query.error === "access_denied") {
        metrics.count("franceconnect.login.aborted");
      } else {
        const error = new OidcError(query.error, query.error_description);
        logger.error(error);
        captureException(error);
      }
      return res.redirect(
        `${exception_redirect_uri}?notification=franceconnect_oidc_error`,
      );
    }

    const { nonce, state } = await FranceConnectOidcSessionSchema.parseAsync(
      req.session,
    );

    const currentUrl = new URL(
      `${HOST ?? `${req.protocol}://${req.hostname}`}${req.originalUrl ?? req.url}`,
    );
    const [franceconnect_error, franceconnect_response] = await to(
      getFranceConnectUser({
        code: query.code,
        currentUrl,
        expectedNonce: nonce,
        expectedState: state,
      }),
    );
    if (franceconnect_error)
      throw new OidcFranceConnectBackChannelError(franceconnect_error.name, {
        cause: franceconnect_error,
      });

    const { user_info, id_token } = franceconnect_response;
    req.session.id_token_hint = id_token;
    req.session.nonce = undefined;
    req.session.state = undefined;

    const { id: userId } = getUserFromAuthenticatedSession(req);

    const updatedUser = await updateFranceConnectUserInfo(userId, user_info);
    updateUserInAuthenticatedSession(req, updatedUser);

    next();
  };
}

export function postFranceConnectLoginRedirectControllerFactory(
  post_login_redirect_uri: string,
) {
  const getFranceConnectRedirectUrl = getFranceConnectRedirectUrlFactory(
    getFranceConnectConfiguration,
    {
      callbackUrl: post_login_redirect_uri,
      scope: FRANCECONNECT_SCOPES.join(" "),
    },
  );

  return async function postFranceConnectLoginRedirectController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { nonce, state } = createOidcChecks();
      req.session.nonce = nonce;
      req.session.state = state;

      const url = await getFranceConnectRedirectUrl(nonce, state);

      return res.redirect(url.toString());
    } catch (error) {
      next(error);
    }
  };
}

export function useFranceConnectLogoutMiddlewareFactory(
  post_logout_redirect_uri: string,
) {
  return async function useFranceConnectLogoutMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.session?.id_token_hint) {
        return next();
      }

      const { state } = createOidcChecks();
      req.session.state = state;
      const [err, url] = await to(
        getFranceConnectLogoutRedirectUrl(
          req.session.id_token_hint,
          post_logout_redirect_uri,
          state,
        ),
      );
      if (err) return next(err);
      return res.redirect(url.href);
    } catch (error) {
      next(error);
    }
  };
}

export function getFranceConnectLogoutCallbackMiddlewareFactory(
  exception_redirect_uri: string,
) {
  return async function getFranceConnectLogoutCallbackMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const query = await z
        .object({ state: z.string() })
        .safeParseAsync(req.query);
      if (!query.success) {
        return next(
          new OidcError("invalid_state", "The query state is invalid", {
            cause: query.error,
          }),
        );
      }

      if (req.session.state === undefined) {
        return res.redirect(
          `${exception_redirect_uri}?notification=franceconnect_oidc_error`,
        );
      }

      if (req.session.state !== query.data.state) {
        return next(
          new OidcError(
            "invalid_state",
            "state mismatch between query and session",
            {
              cause: new AssertionError({
                expected: req.session.state,
                actual: query.data.state,
                operator: "===",
              }),
            },
          ),
        );
      }

      req.session.id_token_hint = undefined;
      req.session.nonce = undefined;
      req.session.state = undefined;

      return next();
    } catch (error) {
      next(error);
    }
  };
}
