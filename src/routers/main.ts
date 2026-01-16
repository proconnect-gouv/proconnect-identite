import { type Express, Router, urlencoded } from "express";
import nocache from "nocache";
import {
  getDoubleAuthenticationController,
  getIsTotpAppInstalledController,
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
import { guard } from "../middlewares/navigation-guards";
import {
  authenticatorRateLimiterMiddleware,
  rateLimiterMiddleware,
} from "../middlewares/rate-limiter";
import { ejsLayoutMiddlewareFactory } from "../services/renderer";

export const mainRouter = (app: Express) => {
  const mainRouter = Router();

  mainRouter.get(
    "/connection-and-account",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    guard.admin,
    csrfProtectionMiddleware,
    getConnectionAndAccountController,
  );

  mainRouter.get(
    "/double-authentication",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    guard.admin,
    csrfProtectionMiddleware,
    getDoubleAuthenticationController,
  );

  mainRouter.get(
    "/is-totp-app-installed",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    guard.admin,
    getIsTotpAppInstalledController,
  );

  mainRouter.get(
    "/totp-configuration",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    guard.admin,
    csrfProtectionMiddleware,
    getTotpConfigurationController,
  );

  mainRouter.post(
    "/totp-configuration",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    guard.admin,
    authenticatorRateLimiterMiddleware,
    csrfProtectionMiddleware,
    postTotpConfigurationController,
  );

  mainRouter.post(
    "/delete-totp-configuration",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    guard.admin,
    csrfProtectionMiddleware,
    postDeleteTotpConfigurationController,
  );

  mainRouter.post(
    "/passkeys/verify-registration",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    guard.admin,
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
    rateLimiterMiddleware,
    guard.admin,
    csrfProtectionMiddleware,
    deletePasskeyController,
  );

  mainRouter.post(
    "/set-force-2fa",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    guard.admin,
    csrfProtectionMiddleware,
    postSetForce2faController,
  );

  mainRouter.get(
    "/personal-information",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    guard.browserTrusted,
    csrfProtectionMiddleware,
    getPersonalInformationsController,
  );

  mainRouter.post(
    "/personal-information",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    guard.browserTrusted,
    csrfProtectionMiddleware,
    postPersonalInformationsController,
  );

  mainRouter.get(
    "/manage-organizations",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    guard.browserTrusted,
    csrfProtectionMiddleware,
    getManageOrganizationsController,
  );

  mainRouter.get(
    "/",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    guard.browserTrusted,
    getHomeController,
  );

  mainRouter.get(
    "/conditions-generales-d-utilisation",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    getConditionsGeneralesDUtilisationController,
  );

  mainRouter.get(
    "/politique-de-confidentialite",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    getPolitiqueDeConfidentialiteController,
  );

  mainRouter.get(
    "/accessibilite",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    getAccessibiliteController,
  );

  return mainRouter;
};

export default mainRouter;
