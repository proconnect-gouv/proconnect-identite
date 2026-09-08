import { Router, urlencoded } from "express";
import nocache from "nocache";
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

export const apiRouter = () => {
  const apiRouter = Router();

  apiRouter.use(nocache());

  apiRouter.use(urlencoded({ extended: false }));

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

  return apiRouter;
};

export default apiRouter;
