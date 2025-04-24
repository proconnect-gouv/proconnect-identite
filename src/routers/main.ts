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
  postVerifyRegistrationController,
} from "../controllers/webauthn";
import { csrfProtectionMiddleware } from "../middlewares/csrf-protection";
import { rateLimiterMiddleware } from "../middlewares/rate-limiter";
import {
  checkUserCanAccessAdminMiddleware,
  checkUserCanAccessAppMiddleware,
} from "../middlewares/user";
import { ejsLayoutMiddlewareFactory } from "../services/renderer";

export const mainRouter = (app: Express) => {
  const mainRouter = Router();

  mainRouter.use(nocache());

  mainRouter.get(
    "/connection-and-account",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    checkUserCanAccessAdminMiddleware,
    csrfProtectionMiddleware,
    getConnectionAndAccountController,
  );

  mainRouter.get(
    "/double-authentication",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    checkUserCanAccessAdminMiddleware,
    csrfProtectionMiddleware,
    getDoubleAuthenticationController,
  );

  mainRouter.get(
    "/configuring-single-use-code",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    checkUserCanAccessAdminMiddleware,
    getConfiguringSingleUseCodeController,
  );

  mainRouter.get(
    "/authenticator-app-configuration",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    checkUserCanAccessAdminMiddleware,
    csrfProtectionMiddleware,
    getAuthenticatorAppConfigurationController,
  );

  mainRouter.post(
    "/authenticator-app-configuration",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    checkUserCanAccessAdminMiddleware,
    csrfProtectionMiddleware,
    postAuthenticatorAppConfigurationController,
  );

  mainRouter.post(
    "/delete-authenticator-app-configuration",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    checkUserCanAccessAdminMiddleware,
    csrfProtectionMiddleware,
    postDeleteAuthenticatorAppConfigurationController,
  );

  mainRouter.post(
    "/passkeys/verify-registration",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    checkUserCanAccessAdminMiddleware,
    csrfProtectionMiddleware,
    postVerifyRegistrationController,
  );

  mainRouter.post(
    "/delete-passkeys/:credential_id",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    checkUserCanAccessAdminMiddleware,
    csrfProtectionMiddleware,
    deletePasskeyController,
  );

  mainRouter.post(
    "/set-force-2fa",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    checkUserCanAccessAdminMiddleware,
    csrfProtectionMiddleware,
    postSetForce2faController,
  );

  mainRouter.get(
    "/personal-information",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    checkUserCanAccessAppMiddleware,
    csrfProtectionMiddleware,
    getPersonalInformationsController,
  );

  mainRouter.post(
    "/personal-information",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    checkUserCanAccessAppMiddleware,
    csrfProtectionMiddleware,
    postPersonalInformationsController,
  );

  mainRouter.get(
    "/manage-organizations",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    checkUserCanAccessAppMiddleware,
    csrfProtectionMiddleware,
    getManageOrganizationsController,
  );

  mainRouter.get(
    "/",
    urlencoded({ extended: false }),
    ejsLayoutMiddlewareFactory(app, true),
    rateLimiterMiddleware,
    checkUserCanAccessAppMiddleware,
    getHomeController,
  );

  return mainRouter;
};

export default mainRouter;
