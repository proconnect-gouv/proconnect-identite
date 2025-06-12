import { type Express, Router, urlencoded } from "express";
import nocache from "nocache";
import {
  getConfiguringSingleUseCodeController,
  getDoubleAuthenticationController,
  postSetForce2faController,
} from "../controllers/2fa";
import {
  getConnectionAndAccountController,
  getHomeController,
  getManageOrganizationsController,
  getPersonalInformationsController,
  postPersonalInformationsController,
} from "../controllers/main";
import {
  getAuthenticatorAppConfigurationController,
  postAuthenticatorAppConfigurationController,
  postDeleteAuthenticatorAppConfigurationController,
} from "../controllers/totp";
import {
  deletePasskeyController,
  postVerifyRegistrationControllerFactory,
} from "../controllers/webauthn";
import { csrfProtectionMiddleware } from "../middlewares/csrf-protection";
import {
  authenticatorRateLimiterMiddleware,
  rateLimiterMiddleware,
} from "../middlewares/rate-limiter";
import {
  checkUserCanAccessAdminMiddleware,
  checkUserCanAccessAppMiddleware,
  checkUserIsConnectedMiddleware,
} from "../middlewares/user";
import { ejsLayoutMiddlewareFactory } from "../services/renderer";

export const mainRouter = (app: Express) => {
  const mainRouter = Router();

  mainRouter.get(
    "/connection-and-account",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    checkUserCanAccessAdminMiddleware,
    csrfProtectionMiddleware,
    getConnectionAndAccountController,
  );

  mainRouter.get(
    "/double-authentication",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    checkUserCanAccessAdminMiddleware,
    csrfProtectionMiddleware,
    getDoubleAuthenticationController,
  );

  mainRouter.get(
    "/configuring-single-use-code",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    checkUserCanAccessAdminMiddleware,
    getConfiguringSingleUseCodeController,
  );

  mainRouter.get(
    "/authenticator-app-configuration",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    checkUserCanAccessAdminMiddleware,
    csrfProtectionMiddleware,
    getAuthenticatorAppConfigurationController,
  );

  mainRouter.post(
    "/authenticator-app-configuration",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    checkUserCanAccessAdminMiddleware,
    authenticatorRateLimiterMiddleware,
    csrfProtectionMiddleware,
    postAuthenticatorAppConfigurationController,
  );

  mainRouter.post(
    "/delete-authenticator-app-configuration",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    checkUserCanAccessAdminMiddleware,
    csrfProtectionMiddleware,
    postDeleteAuthenticatorAppConfigurationController,
  );

  mainRouter.post(
    "/passkeys/verify-registration",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    checkUserIsConnectedMiddleware,
    csrfProtectionMiddleware,
    postVerifyRegistrationControllerFactory(
      "/connection-and-account?notification=passkey_successfully_created",
    ),
  );

  mainRouter.post(
    "/delete-passkeys/:credential_id",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    checkUserCanAccessAdminMiddleware,
    csrfProtectionMiddleware,
    deletePasskeyController,
  );

  mainRouter.post(
    "/set-force-2fa",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    checkUserCanAccessAdminMiddleware,
    csrfProtectionMiddleware,
    postSetForce2faController,
  );

  mainRouter.get(
    "/personal-information",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    checkUserCanAccessAppMiddleware,
    csrfProtectionMiddleware,
    getPersonalInformationsController,
  );

  mainRouter.post(
    "/personal-information",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    checkUserCanAccessAppMiddleware,
    csrfProtectionMiddleware,
    postPersonalInformationsController,
  );

  mainRouter.get(
    "/manage-organizations",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    checkUserCanAccessAppMiddleware,
    csrfProtectionMiddleware,
    getManageOrganizationsController,
  );

  mainRouter.get(
    "/",
    nocache(),
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    checkUserCanAccessAppMiddleware,
    getHomeController,
  );

  return mainRouter;
};

export default mainRouter;
