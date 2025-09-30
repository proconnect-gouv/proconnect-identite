//

import {
  createOidcChecks,
  getFranceConnectRedirectUrlFactory,
} from "@proconnect-gouv/proconnect.identite/managers/franceconnect";
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
import { getOrganizationsByUserId } from "../../managers/organization/main";
import {
  getUserFromAuthenticatedSession,
  updateUserInAuthenticatedSession,
} from "../../managers/session/authenticated";
import { FranceConnectOidcSessionSchema } from "../../managers/session/franceconnect";
import { updateFranceConnectUserInfo } from "../../managers/user";
import { updateUserOrganizationLink } from "../../repositories/organization/setters";

//

export async function getFranceConnectLoginCallbackMiddleware(
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
      throw new OidcError(error, error_description, {
        cause: errorQuery.error,
      });
    }
    const { code } = await z.object({ code: z.string() }).parseAsync(req.query);

    const { nonce, state } = await FranceConnectOidcSessionSchema.parseAsync(
      req.session,
    );

    const currentUrl = new URL(
      `${HOST ?? `${req.protocol}://${req.hostname}`}${req.originalUrl ?? req.url}`,
    );
    const [franceconnect_error, franceconnect_response] = await to(
      getFranceConnectUser({
        code,
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

    const userOrganizations = await getOrganizationsByUserId(userId);

    await Promise.all(
      userOrganizations.map(({ id }) =>
        updateUserOrganizationLink(id, userId, {
          verification_type: null,
          verified_at: null,
        }),
      ),
    );

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

export function getFranceConnectLogoutCallbackControllerFactory(
  redirect_url: string,
) {
  return async function getFranceConnectLogoutCallbackController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const query = await z
        .object({ state: z.string() })
        .safeParseAsync(req.query);
      if (!query.success) {
        throw new OidcError("invalid_state", "The query state is invalid", {
          cause: query.error,
        });
      }

      const franceconnect_session = await FranceConnectOidcSessionSchema.pick({
        state: true,
      }).safeParseAsync(req.session);
      if (!franceconnect_session.success) {
        throw new OidcError("invalid_state", "The session state is invalid", {
          cause: franceconnect_session.error,
        });
      }

      if (franceconnect_session.data.state !== query.data.state) {
        throw new OidcError(
          "invalid_state",
          "state mismatch between query and session",
          {
            cause: new AssertionError({
              expected: franceconnect_session.data.state,
              actual: query.data.state,
              operator: "===",
            }),
          },
        );
      }

      req.session.id_token_hint = undefined;
      req.session.nonce = undefined;
      req.session.state = undefined;

      return res.redirect(redirect_url);
    } catch (error) {
      next(error);
    }
  };
}
