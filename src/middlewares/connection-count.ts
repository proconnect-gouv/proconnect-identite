import * as Sentry from "@sentry/node";
import type { NextFunction } from "express";
import type { KoaContextWithOIDC } from "oidc-provider";
import { recordNewConnection } from "../managers/oidc-client";
import { logger } from "../services/log";

// this is not an express middleware but an oidc-provider middleware as described here:
// https://github.com/panva/node-oidc-provider/blob/v7.x/docs/README.md#pre--and-post-middlewares
export const connectionCountMiddleware = async (
  ctx: KoaContextWithOIDC,
  next: NextFunction,
) => {
  // We do not have enough testing tools to properly cover this.
  // We developed it by manually testing the following user journey:
  // - the user log in application A
  // - the user log in application B
  // - the user logout from application A
  // - the user log in application A

  // We retro-engineered the oidcProvider behavior by logging variables as follows:
  // logger.info('pre middleware', ctx.method, ctx.path);
  await next();

  // logger.info('post middleware', ctx.method, ctx.oidc.route);
  // logger.info(ctx.oidc.client?.clientId, 'ctx.oidc.client.clientId');
  // logger.info(ctx.oidc.session?.accountId, 'ctx.oidc.session.accountId');

  if (
    (ctx.oidc?.route === "authorization" && ctx.oidc?.session?.accountId) ||
    ctx.oidc?.route === "resume"
  ) {
    // we log a connection in 2 cases:
    // 1. a client ask for a connection and the oidcProvider answer back with an accountId
    // this happens when users is already logged in ProConnect Identité but not on the client
    // 2. a client ask for a connection but is not logged in ProConnect Identité
    // There is no accountId in the session, we wait for a session to be open.
    // This happens when hitting the resume route.
    try {
      // if the interaction resulted in a success accountId and clientId should be set
      if (ctx.oidc.session?.accountId && ctx.oidc.client?.clientId) {
        await recordNewConnection({
          accountId: ctx.oidc.session.accountId,
          client: ctx.oidc.client,
          params: ctx.oidc.params as OIDCContextParams,
        });
      }
    } catch (err) {
      logger.error(err);
      Sentry.captureException(err);
    }
  }
};
