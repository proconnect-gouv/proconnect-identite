import { Router, urlencoded } from "express";
import nocache from "nocache";
import {
  getOrganizationInfoController,
  getPingApiAnnuaireEducationNationaleController,
  getPingApiDebounceController,
  getPingApiEntrepriseController,
  getPingApiInseeController,
  getPingApiRegistreNationalEntreprisesController,
  getPingGithubPasskeyAuthenticatorAaguidsController,
  getPingPwnedPasswordsController,
} from "../controllers/api";
import {
  getGenerateAuthenticationOptionsForFirstFactorController,
  getGenerateAuthenticationOptionsForSecondFactorController,
  getGenerateRegistrationOptionsController,
} from "../controllers/webauthn";
import {
  externalDependencyRateLimiterMiddleware,
  rnePingRateLimiterMiddleware,
} from "../middlewares/rate-limiter";

export const apiRouter = () => {
  const apiRouter = Router();

  apiRouter.use(nocache());

  apiRouter.use(urlencoded({ extended: false }));

  apiRouter.get(
    "/insee/ping",
    externalDependencyRateLimiterMiddleware,
    getPingApiInseeController,
  );
  apiRouter.get(
    "/debounce/ping",
    externalDependencyRateLimiterMiddleware,
    getPingApiDebounceController,
  );
  apiRouter.get(
    "/pwned-passwords/ping",
    externalDependencyRateLimiterMiddleware,
    getPingPwnedPasswordsController,
  );
  apiRouter.get(
    "/github-passkey-authenticator-aaguids/ping",
    externalDependencyRateLimiterMiddleware,
    getPingGithubPasskeyAuthenticatorAaguidsController,
  );
  apiRouter.get(
    "/annuaire-education-nationale/ping",
    externalDependencyRateLimiterMiddleware,
    getPingApiAnnuaireEducationNationaleController,
  );
  apiRouter.get(
    "/rne/ping",
    rnePingRateLimiterMiddleware,
    getPingApiRegistreNationalEntreprisesController,
  );
  apiRouter.get(
    "/api-entreprise/ping",
    externalDependencyRateLimiterMiddleware,
    getPingApiEntrepriseController,
  );

  apiRouter.get("/organization-info/:siret", getOrganizationInfoController);

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

  return apiRouter;
};

export default apiRouter;
