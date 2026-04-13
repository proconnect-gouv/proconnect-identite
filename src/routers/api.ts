import type { NextFunction, Request, Response } from "express";
import { Router, urlencoded } from "express";
import { HttpError } from "http-errors";
import nocache from "nocache";
import { inspect } from "node:util";
import {
  getOrganizationInfoController,
  getPingApiAnnuaireEducationNationaleController,
  getPingApiDebounceController,
  getPingApiInseeController,
  getPingApiRegistreNationalEntreprisesController,
  getPingApiSireneController,
  getPingGithubPasskeyAuthenticatorAaguidsController,
  getPingPwnedPasswordsController,
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

  apiRouter.get("/insee/ping", getPingApiInseeController);
  apiRouter.get("/debounce/ping", getPingApiDebounceController);
  apiRouter.get("/pwned-passwords/ping", getPingPwnedPasswordsController);
  apiRouter.get(
    "/github-passkey-authenticator-aaguids/ping",
    getPingGithubPasskeyAuthenticatorAaguidsController,
  );
  apiRouter.get(
    "/annuaire-education-nationale/ping",
    getPingApiAnnuaireEducationNationaleController,
  );
  apiRouter.get("/rne/ping", getPingApiRegistreNationalEntreprisesController);
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
