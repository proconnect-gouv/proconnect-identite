import type { NextFunction, Request, Response } from "express";
import { Router, urlencoded } from "express";
import expressBasicAuth from "express-basic-auth";
import { HttpError } from "http-errors";
import nocache from "nocache";
import { inspect } from "node:util";
import { API_AUTH_PASSWORD, API_AUTH_USERNAME } from "../config/env";
import {
  getOrganizationInfoController,
  getPingApiSireneController,
  postForceJoinOrganizationController,
  postMarkDomainAsVerified,
  postSendModerationProcessedEmail,
} from "../controllers/api";
import {
  getGenerateAuthenticationOptionsForFirstFactorController,
  getGenerateAuthenticationOptionsForSecondFactorController,
  getGenerateRegistrationOptionsController,
} from "../controllers/webauthn";
import { apiRateLimiterMiddleware } from "../middlewares/rate-limiter";
import { logger } from "../services/log";

export const apiRouter = () => {
  const apiRouter = Router();

  apiRouter.use(nocache());

  apiRouter.use(urlencoded({ extended: false }));

  apiRouter.get(
    "/sirene/ping",
    apiRateLimiterMiddleware,
    getPingApiSireneController,
  );

  apiRouter.get(
    "/sirene/organization-info/:siret",
    apiRateLimiterMiddleware,
    getOrganizationInfoController,
  );

  apiRouter.get(
    "/webauthn/generate-registration-options",
    apiRateLimiterMiddleware,
    getGenerateRegistrationOptionsController,
  );

  apiRouter.get(
    "/webauthn/generate-authentication-options-for-first-factor",
    apiRateLimiterMiddleware,
    getGenerateAuthenticationOptionsForFirstFactorController,
  );

  apiRouter.get(
    "/webauthn/generate-authentication-options-for-second-factor",
    apiRateLimiterMiddleware,
    getGenerateAuthenticationOptionsForSecondFactorController,
  );

  const apiAdminRouter = Router();

  apiAdminRouter.use(
    apiRateLimiterMiddleware,
    expressBasicAuth({
      users: { [API_AUTH_USERNAME]: API_AUTH_PASSWORD },
    }),
  );

  apiAdminRouter.post(
    "/join-organization",
    postForceJoinOrganizationController,
  );

  apiAdminRouter.post(
    "/send-moderation-processed-email",
    postSendModerationProcessedEmail,
  );

  apiAdminRouter.post("/mark-domain-as-verified", postMarkDomainAsVerified);

  apiRouter.use("/admin", apiAdminRouter);

  apiRouter.use(
    async (
      err: HttpError,
      _req: Request,
      res: Response,
      _next: NextFunction,
    ) => {
      logger.error(inspect(err, { depth: null }));

      const statusCode = err.statusCode || 500;

      return res
        .status(statusCode)
        .json({ message: err.message || err["statusMessage"] });
    },
  );

  return apiRouter;
};

export default apiRouter;
