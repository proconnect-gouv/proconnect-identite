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

  apiRouter.use(apiRateLimiterMiddleware);

  apiRouter.get("/sirene/ping", getPingApiSireneController);

  apiRouter.get(
    "/sirene/organization-info/:siret",
    getOrganizationInfoController,
  );

  apiRouter.get(
    "/webauthn/generate-registration-options",
    getGenerateRegistrationOptionsController,
  );

  apiRouter.get(
    "/webauthn/generate-authentication-options-for-first-factor",
    getGenerateAuthenticationOptionsForFirstFactorController,
  );

  apiRouter.get(
    "/webauthn/generate-authentication-options-for-second-factor",
    getGenerateAuthenticationOptionsForSecondFactorController,
  );

  const apiAdminRouter = Router();

  apiAdminRouter.use(
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
      logger.error(inspect(err, { depth: 3 }));

      const statusCode = err.statusCode || 500;

      return res
        .status(statusCode)
        .json({ message: err.message || err["statusMessage"] });
    },
  );

  return apiRouter;
};

export default apiRouter;
