import { type Express, Router, urlencoded } from "express";
import nocache from "nocache";
import {
  getDoubleAuthenticationController,
  getIsTotpAppInstalledController,
  getMfaDecisionHelperCanInstallSoftwareController,
  getMfaDecisionHelperCanInstallSoftwareExternalHelpNeededController,
  getMfaDecisionHelperCanInstallSoftwareSmartphoneAppController,
  getMfaDecisionHelperCanInstallSoftwareSmartphoneController,
  getMfaDecisionHelperCanInstallSoftwareSoftwareController,
  getMfaDecisionHelperController,
  getMfaDecisionHelperPasskeyController,
  postSetForce2faController,
} from "../controllers/2fa";
import {
  getAccessibiliteController,
  getConditionsGeneralesDUtilisationController,
  getConnectionAndAccountController,
  getHomeController,
  getManageOrganizationsController,
  getPersonalInformationsController,
  getPolitiqueDeConfidentialiteController,
  postDisconnectFranceConnectController,
  postPersonalInformationsController,
} from "../controllers/main";
import {
  getTotpConfigurationController,
  postDeleteTotpConfigurationController,
  postTotpConfigurationController,
} from "../controllers/totp";
import {
  deletePasskeyController,
  postVerifyRegistrationControllerFactory,
} from "../controllers/webauthn";
import { csrfProtectionMiddleware } from "../middlewares/csrf-protection";
import {
  userCanAccessAdminGuardMiddleware,
  userCanAccessAppGuardMiddleware,
} from "../middlewares/navigation-guards";
import { authenticatorRateLimiterMiddleware } from "../middlewares/rate-limiter";
import { ejsLayoutMiddlewareFactory } from "../services/renderer";

export const mainRouter = (app: Express) => {
  const mainRouter = Router();

  mainRouter.get(
    "/connection-and-account",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    userCanAccessAdminGuardMiddleware,
    csrfProtectionMiddleware,
    getConnectionAndAccountController,
  );

  mainRouter.get(
    "/double-authentication-choice",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    userCanAccessAdminGuardMiddleware,
    csrfProtectionMiddleware,
    getDoubleAuthenticationController,
  );

  mainRouter.get(
    "/is-totp-app-installed",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    userCanAccessAdminGuardMiddleware,
    getIsTotpAppInstalledController,
  );

  mainRouter.get(
    "/mfa-decision-helper",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    userCanAccessAdminGuardMiddleware,
    csrfProtectionMiddleware,
    getMfaDecisionHelperController,
  );

  mainRouter.get(
    "/mfa-decision-helper/passkey",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    userCanAccessAdminGuardMiddleware,
    csrfProtectionMiddleware,
    getMfaDecisionHelperPasskeyController,
  );

  mainRouter.get(
    "/mfa-decision-helper/can-install-software",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    userCanAccessAdminGuardMiddleware,
    csrfProtectionMiddleware,
    getMfaDecisionHelperCanInstallSoftwareController,
  );

  mainRouter.get(
    "/mfa-decision-helper/can-install-software/software",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    userCanAccessAdminGuardMiddleware,
    csrfProtectionMiddleware,
    getMfaDecisionHelperCanInstallSoftwareSoftwareController,
  );

  mainRouter.get(
    "/mfa-decision-helper/can-install-software/smartphone",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    userCanAccessAdminGuardMiddleware,
    csrfProtectionMiddleware,
    getMfaDecisionHelperCanInstallSoftwareSmartphoneController,
  );

  mainRouter.get(
    "/mfa-decision-helper/can-install-software/smartphone/app",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    userCanAccessAdminGuardMiddleware,
    csrfProtectionMiddleware,
    getMfaDecisionHelperCanInstallSoftwareSmartphoneAppController,
  );

  mainRouter.get(
    "/mfa-decision-helper/can-install-software/external-help-needed",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    userCanAccessAdminGuardMiddleware,
    csrfProtectionMiddleware,
    getMfaDecisionHelperCanInstallSoftwareExternalHelpNeededController,
  );

  mainRouter.get(
    "/totp-configuration",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    userCanAccessAdminGuardMiddleware,
    csrfProtectionMiddleware,
    getTotpConfigurationController,
  );

  mainRouter.post(
    "/totp-configuration",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    userCanAccessAdminGuardMiddleware,
    authenticatorRateLimiterMiddleware,
    csrfProtectionMiddleware,
    postTotpConfigurationController,
  );

  mainRouter.post(
    "/delete-totp-configuration",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    userCanAccessAdminGuardMiddleware,
    csrfProtectionMiddleware,
    postDeleteTotpConfigurationController,
  );

  mainRouter.post(
    "/passkeys/verify-registration",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    userCanAccessAdminGuardMiddleware,
    csrfProtectionMiddleware,
    postVerifyRegistrationControllerFactory(
      "/connection-and-account?notification=passkey_successfully_created",
      "/connection-and-account?notification=invalid_passkey",
    ),
  );

  mainRouter.post(
    "/delete-passkeys/:credential_id",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    userCanAccessAdminGuardMiddleware,
    csrfProtectionMiddleware,
    deletePasskeyController,
  );

  mainRouter.post(
    "/set-force-2fa",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    userCanAccessAdminGuardMiddleware,
    csrfProtectionMiddleware,
    postSetForce2faController,
  );

  mainRouter.get(
    "/personal-information",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    getPersonalInformationsController,
  );

  mainRouter.post(
    "/personal-information",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    postPersonalInformationsController,
  );

  mainRouter.post(
    "/personal-information/franceconnect/disconnect",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    postDisconnectFranceConnectController,
  );

  mainRouter.get(
    "/manage-organizations",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    getManageOrganizationsController,
  );

  mainRouter.get(
    "/",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    userCanAccessAppGuardMiddleware,
    getHomeController,
  );

  mainRouter.get(
    "/conditions-generales-d-utilisation",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    getConditionsGeneralesDUtilisationController,
  );

  mainRouter.get(
    "/politique-de-confidentialite",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    getPolitiqueDeConfidentialiteController,
  );

  mainRouter.get(
    "/accessibilite",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    getAccessibiliteController,
  );

  return mainRouter;
};

export default mainRouter;
