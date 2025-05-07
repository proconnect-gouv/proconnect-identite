//

import {
  createOidcChecks,
  getFranceConnectRedirectUrlFactory,
} from "@gouvfr-lasuite/proconnect.identite/managers/franceconnect";
import { logger } from "@sentry/node";
import { to } from "await-to-js";
import { type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { FRANCECONNECT_SCOPES, HOST } from "../../config/env";
import { OidcError } from "../../config/errors";
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

//

export async function getFranceConnectOidcCallbackToUpdateUserMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const errorQuery = await z
      .object({ error: z.string(), error_description: z.string() })
      .safeParseAsync(req.query);

    if (errorQuery.success) {
      const { error, error_description } = errorQuery.data;
      throw new OidcError(error, error_description);
    }
    const { code } = await z.object({ code: z.string() }).parseAsync(req.query);

    const { nonce, state } = await FranceConnectOidcSessionSchema.parseAsync(
      req.session,
    );

    const currentUrl = new URL(
      `${req.protocol}://${HOST ?? req.hostname}${req.originalUrl ?? req.url}`,
    );
    logger.debug("FranceConnect oidc callback", {
      code,
      nonce,
      state,
      currentUrl,
    });
    const { user_info, id_token } = await getFranceConnectUser({
      code,
      currentUrl,
      expectedNonce: nonce,
      expectedState: state,
    });
    req.session.id_token_hint = id_token;

    const { id: user_id } = getUserFromAuthenticatedSession(req);

    const updatedUser = await updateFranceConnectUserInfo(user_id, user_info);
    updateUserInAuthenticatedSession(req, updatedUser);

    next();
  } catch (error) {
    next(error);
  }
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
  return async function franceConnectLogoutMiddleware(
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

export function getFranceConnectLogoutCallbackControllerFactory(
  redirect_url: string,
) {
  return function getFranceConnectLogoutController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      req.session.id_token_hint = undefined;
      req.session.nonce = undefined;
      req.session.state = undefined;

      return res.redirect(redirect_url);
    } catch (error) {
      next(error);
    }
  };
}
