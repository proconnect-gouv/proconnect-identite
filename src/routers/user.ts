import { Router, urlencoded } from "express";
import nocache from "nocache";
import { HOST } from "../config/env";
import {
  getAccessRestrictedToPrivateSectorEmailController,
  getAccessRestrictedToPublicSectorEmailController,
  getCertificationDirigeantCloseMatchError,
  getCertificationDirigeantNoMatchError,
  getCertificationDirigeantOrganizationNotCoveredError,
  getDomainsRestrictedInOrganizationController,
  getJoinOrganizationConfirmController,
  getJoinOrganizationController,
  getModerationRejectedController,
  getOrganizationSuggestionsController,
  getUnableToAutoJoinOrganizationController,
  postJoinOrganizationMiddleware,
  postQuitUserOrganizationController,
} from "../controllers/organization";
import { postSignInWithTotpController } from "../controllers/totp";
import { getCertificationDirigeantController } from "../controllers/user/certification-dirigeant";
import { postDeleteUserController } from "../controllers/user/delete";

import { get2faSignInController } from "../controllers/user/2fa-sign-in";
import {
  postCancelModerationAndRedirectControllerFactory,
  postReopenModerationAndRedirectControllerFactory,
} from "../controllers/user/edit-moderation";
import {
  getFranceConnectLoginCallbackMiddlewareFactory,
  getFranceConnectLogoutCallbackMiddleware,
  postFranceConnectLoginRedirectControllerFactory,
  useFranceConnectLogoutMiddlewareFactory,
} from "../controllers/user/franceconnect";
import { issueSessionOrRedirectController } from "../controllers/user/issue-session-or-redirect";
import {
  getMagicLinkSentController,
  getSignInWithMagicLinkController,
  postSendMagicLinkController,
  postSignInWithMagicLinkController,
} from "../controllers/user/magic-link";
import {
  getOfficialContactEmailVerificationController,
  postOfficialContactEmailVerificationMiddleware,
} from "../controllers/user/official-contact-email-verification";
import {
  getSelectOrganizationController,
  postSelectOrganizationMiddleware,
} from "../controllers/user/select-organization";
import {
  getInclusionconnectWelcomeController,
  getSignInController,
  getSignUpController,
  getStartSignInController,
  postInclusionconnectWelcomeController,
  postSignInMiddleware,
  postSignUpController,
  postStartSignInController,
} from "../controllers/user/signin-signup";
import {
  get2faSuccessfullyConfiguredController,
  getIsTotpAppInstalledController,
  getTotpConfigurationController,
  getTwoFactorsAuthenticationChoiceController,
  post2faSuccessfullyConfiguredMiddleware,
  postTotpConfigurationController,
} from "../controllers/user/two-factors-authentication-configuration";
import {
  getChangePasswordController,
  getResetPasswordController,
  postChangePasswordController,
  postResetPasswordController,
} from "../controllers/user/update-password";
import {
  getPersonalInformationsController,
  postPersonalInformationsController,
} from "../controllers/user/update-personal-informations";
import {
  getVerifyEmailController,
  postSendEmailVerificationController,
  postVerifyEmailController,
} from "../controllers/user/verify-email";
import {
  getWelcomeController,
  getWelcomeDirigeantController,
} from "../controllers/user/welcome";
import {
  postVerifyFirstFactorAuthenticationController,
  postVerifyRegistrationControllerFactory,
  postVerifySecondFactorAuthenticationController,
} from "../controllers/webauthn";
import { csrfProtectionMiddleware } from "../middlewares/csrf-protection";
import { guard } from "../middlewares/navigation-guards";
import {
  authenticatorRateLimiterMiddleware,
  passwordRateLimiterMiddleware,
  rateLimiterMiddleware,
  sendMagicLinkRateLimiterMiddleware,
  verifyEmailRateLimiterMiddleware,
} from "../middlewares/rate-limiter";

export const userRouter = () => {
  const userRouter = Router();

  userRouter.use(nocache());

  userRouter.use(urlencoded({ extended: false }));

  userRouter.use(rateLimiterMiddleware);

  userRouter.get(
    "/start-sign-in",
    guard.isUser,
    csrfProtectionMiddleware,
    getStartSignInController,
  );
  userRouter.post(
    "/start-sign-in",
    guard.isUser,
    csrfProtectionMiddleware,
    postStartSignInController,
  );

  userRouter.get(
    "/inclusionconnect-welcome",
    guard.emailInSession,
    csrfProtectionMiddleware,
    getInclusionconnectWelcomeController,
  );
  userRouter.post(
    "/inclusionconnect-welcome",
    guard.emailInSession,
    csrfProtectionMiddleware,
    postInclusionconnectWelcomeController,
  );
  userRouter.get(
    "/sign-in",
    guard.credentialPromptReady,
    csrfProtectionMiddleware,
    getSignInController,
  );
  userRouter.post(
    "/sign-in",
    guard.credentialPromptReady,
    csrfProtectionMiddleware,
    passwordRateLimiterMiddleware,
    postSignInMiddleware,
    guard.signInRequirements,
    issueSessionOrRedirectController,
  );
  userRouter.get(
    "/sign-up",
    guard.credentialPromptReady,
    csrfProtectionMiddleware,
    getSignUpController,
  );
  userRouter.post(
    "/sign-up",
    guard.credentialPromptReady,
    csrfProtectionMiddleware,
    postSignUpController,
    guard.signInRequirements,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/double-authentication-choice",
    guard.connectedRecently,
    csrfProtectionMiddleware,
    getTwoFactorsAuthenticationChoiceController,
  );

  userRouter.get(
    "/is-totp-app-installed",
    guard.connectedRecently,
    csrfProtectionMiddleware,
    getIsTotpAppInstalledController,
  );

  userRouter.get(
    "/totp-configuration",
    guard.connectedRecently,
    csrfProtectionMiddleware,
    getTotpConfigurationController,
  );

  userRouter.post(
    "/totp-configuration",
    guard.connectedRecently,
    authenticatorRateLimiterMiddleware,
    csrfProtectionMiddleware,
    postTotpConfigurationController,
  );

  userRouter.get(
    "/2fa-successfully-configured",
    guard.connectedRecently,
    csrfProtectionMiddleware,
    get2faSuccessfullyConfiguredController,
  );

  userRouter.post(
    "/2fa-successfully-configured",
    guard.connectedRecently,
    csrfProtectionMiddleware,
    post2faSuccessfullyConfiguredMiddleware,
    guard.signInRequirements,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/2fa-sign-in",
    guard.verified,
    csrfProtectionMiddleware,
    get2faSignInController,
  );

  userRouter.post(
    "/2fa-sign-in-with-totp",
    guard.verified,
    csrfProtectionMiddleware,
    authenticatorRateLimiterMiddleware,
    postSignInWithTotpController,
    guard.signInRequirements,
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/2fa-sign-in-with-passkey",
    guard.verified,
    csrfProtectionMiddleware,
    postVerifySecondFactorAuthenticationController,
    guard.signInRequirements,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/verify-email",
    guard.connected,
    csrfProtectionMiddleware,
    getVerifyEmailController,
  );
  userRouter.post(
    "/verify-email",
    guard.connected,
    csrfProtectionMiddleware,
    verifyEmailRateLimiterMiddleware,
    postVerifyEmailController,
    guard.signInRequirements,
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/send-email-verification",
    guard.connected,
    csrfProtectionMiddleware,
    postSendEmailVerificationController,
  );
  userRouter.post(
    "/send-magic-link",
    guard.credentialPromptReady,
    csrfProtectionMiddleware,
    sendMagicLinkRateLimiterMiddleware,
    postSendMagicLinkController,
    guard.signInRequirements,
    issueSessionOrRedirectController,
  );
  userRouter.get("/magic-link-sent", getMagicLinkSentController);
  userRouter.get(
    "/sign-in-with-magic-link",
    csrfProtectionMiddleware,
    getSignInWithMagicLinkController,
  );
  userRouter.post(
    "/sign-in-with-magic-link",
    csrfProtectionMiddleware,
    postSignInWithMagicLinkController,
    guard.signInRequirements,
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/sign-in-with-passkey",
    guard.credentialPromptReady,
    csrfProtectionMiddleware,
    postVerifyFirstFactorAuthenticationController,
    guard.signInRequirements,
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/passkeys/verify-registration",
    guard.connectedRecently,
    csrfProtectionMiddleware,
    postVerifyRegistrationControllerFactory(
      "/users/2fa-successfully-configured",
      "users/double-authentication-choice?notification=invalid_passkey",
    ),
  );

  userRouter.get(
    "/reset-password",
    csrfProtectionMiddleware,
    getResetPasswordController,
  );

  userRouter.post(
    "/reset-password",
    csrfProtectionMiddleware,
    postResetPasswordController,
  );
  userRouter.get(
    "/change-password",
    csrfProtectionMiddleware,
    getChangePasswordController,
  );
  userRouter.post(
    "/change-password",
    csrfProtectionMiddleware,
    postChangePasswordController,
  );

  userRouter.get(
    "/personal-information",
    guard.browserTrusted,
    csrfProtectionMiddleware,
    getPersonalInformationsController,
  );
  userRouter.post(
    "/personal-information",
    guard.browserTrusted,
    csrfProtectionMiddleware,
    postPersonalInformationsController,
    guard.signInRequirements,
    issueSessionOrRedirectController,
  );
  userRouter.post(
    "/personal-information/franceconnect/login",
    guard.browserTrusted,
    csrfProtectionMiddleware,
    postFranceConnectLoginRedirectControllerFactory(
      `${HOST}/users/personal-information/franceconnect/login/callback`,
    ),
  );
  userRouter.get(
    "/personal-information/franceconnect/login/callback",
    guard.browserTrusted,
    getFranceConnectLoginCallbackMiddlewareFactory(
      `${HOST}/personal-information`,
    ),
    useFranceConnectLogoutMiddlewareFactory(
      `${HOST}/users/personal-information/franceconnect/logout/callback`,
    ),
  );
  userRouter.get(
    "/personal-information/franceconnect/logout/callback",
    guard.browserTrusted,
    csrfProtectionMiddleware,
    getFranceConnectLogoutCallbackMiddleware,
    (_req, res) =>
      res.redirect(
        "/personal-information?notification=personal_information_update_via_franceconnect_success",
      ),
  );

  userRouter.get(
    "/organization-suggestions",
    guard.browserTrusted,
    csrfProtectionMiddleware,
    getOrganizationSuggestionsController,
  );

  userRouter.get(
    "/join-organization",
    guard.browserTrusted,
    csrfProtectionMiddleware,
    getJoinOrganizationController,
  );
  userRouter.post(
    "/join-organization",
    guard.browserTrusted,
    csrfProtectionMiddleware,
    postJoinOrganizationMiddleware,
    guard.signInRequirements,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/join-organization-confirm",
    guard.browserTrusted,
    csrfProtectionMiddleware,
    getJoinOrganizationConfirmController,
  );

  userRouter.get(
    "/domains-restricted-in-organization",
    guard.browserTrusted,
    csrfProtectionMiddleware,
    getDomainsRestrictedInOrganizationController,
  );

  userRouter.get(
    "/unable-to-auto-join-organization",
    guard.browserTrusted,
    csrfProtectionMiddleware,
    getUnableToAutoJoinOrganizationController,
  );
  userRouter.get(
    "/moderation-rejected",
    guard.browserTrusted,
    csrfProtectionMiddleware,
    getModerationRejectedController,
  );
  userRouter.get(
    "/access-restricted-to-public-sector-email",
    guard.browserTrusted,
    csrfProtectionMiddleware,
    getAccessRestrictedToPublicSectorEmailController,
  );

  userRouter.get(
    "/access-restricted-to-private-sector-email",
    guard.browserTrusted,
    csrfProtectionMiddleware,
    getAccessRestrictedToPrivateSectorEmailController,
  );

  userRouter.post(
    "/cancel-moderation-and-redirect-to-sign-in/:moderation_id",
    guard.browserTrusted,
    csrfProtectionMiddleware,
    postCancelModerationAndRedirectControllerFactory("/users/start-sign-in"),
  );

  userRouter.post(
    "/cancel-moderation-and-redirect-to-join-org/:moderation_id",
    guard.browserTrusted,
    csrfProtectionMiddleware,
    postCancelModerationAndRedirectControllerFactory(
      "/users/join-organization",
    ),
  );

  userRouter.post(
    "/cancel-moderation-and-redirect-to-personal-information/:moderation_id",
    guard.browserTrusted,
    csrfProtectionMiddleware,
    postCancelModerationAndRedirectControllerFactory(
      "/users/personal-information",
    ),
  );
  userRouter.post(
    "/reopen-moderation/:moderation_id",
    guard.browserTrusted,
    csrfProtectionMiddleware,
    postReopenModerationAndRedirectControllerFactory(
      "/users/personal-information",
    ),
  );

  userRouter.get(
    "/select-organization",
    guard.hasAtLeastOneOrganization,
    csrfProtectionMiddleware,
    getSelectOrganizationController,
  );

  userRouter.post(
    "/select-organization",
    guard.hasAtLeastOneOrganization,
    csrfProtectionMiddleware,
    postSelectOrganizationMiddleware,
    guard.signInRequirements,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/official-contact-email-verification/:organization_id",
    guard.hasSelectedAnOrganization,
    csrfProtectionMiddleware,
    getOfficialContactEmailVerificationController,
  );

  userRouter.post(
    "/official-contact-email-verification/:organization_id",
    guard.hasSelectedAnOrganization,
    csrfProtectionMiddleware,
    postOfficialContactEmailVerificationMiddleware,
    guard.signInRequirements,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/welcome",
    guard.signInRequirements,
    csrfProtectionMiddleware,
    getWelcomeController,
  );
  userRouter.get(
    "/welcome/dirigeant",
    guard.signInRequirements,
    csrfProtectionMiddleware,
    getWelcomeDirigeantController,
  );

  userRouter.post(
    "/welcome",
    guard.signInRequirements,
    csrfProtectionMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/quit-organization/:id",
    guard.hasAtLeastOneOrganization,
    csrfProtectionMiddleware,
    postQuitUserOrganizationController,
  );

  userRouter.post(
    "/cancel-moderation/:moderation_id",
    guard.browserTrusted,
    csrfProtectionMiddleware,
    postCancelModerationAndRedirectControllerFactory(
      "/manage-organizations?notification=cancel_moderation_success",
    ),
  );

  userRouter.post(
    "/delete",
    guard.admin,
    csrfProtectionMiddleware,
    postDeleteUserController,
  );

  userRouter.get(
    "/franceconnect/logout/callback",
    guard.admin,
    getFranceConnectLogoutCallbackMiddleware,
    (_req, res) => res.redirect("/oauth/logout"),
  );

  userRouter.get(
    "/certification-dirigeant",
    guard.browserTrusted,
    csrfProtectionMiddleware,
    getCertificationDirigeantController,
  );

  userRouter.post(
    "/certification-dirigeant/franceconnect/login",
    guard.browserTrusted,
    csrfProtectionMiddleware,
    postFranceConnectLoginRedirectControllerFactory(
      `${HOST}/users/certification-dirigeant/franceconnect/login/callback`,
    ),
  );

  userRouter.get(
    "/certification-dirigeant/franceconnect/login/callback",
    guard.browserTrusted,
    getFranceConnectLoginCallbackMiddlewareFactory(
      `${HOST}/users/certification-dirigeant`,
    ),
    useFranceConnectLogoutMiddlewareFactory(
      `${HOST}/users/certification-dirigeant/franceconnect/logout/callback`,
    ),
  );

  userRouter.get(
    "/certification-dirigeant/franceconnect/logout/callback",
    guard.browserTrusted,
    csrfProtectionMiddleware,
    getFranceConnectLogoutCallbackMiddleware,
    guard.signInRequirements,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/certification-dirigeant/organization-not-covered-error",
    guard.browserTrusted,
    csrfProtectionMiddleware,
    getCertificationDirigeantOrganizationNotCoveredError,
  );

  userRouter.get(
    "/certification-dirigeant/close-match-error",
    guard.browserTrusted,
    csrfProtectionMiddleware,
    getCertificationDirigeantCloseMatchError,
  );

  userRouter.get(
    "/certification-dirigeant/no-match-error",
    guard.browserTrusted,
    csrfProtectionMiddleware,
    getCertificationDirigeantNoMatchError,
  );

  return userRouter;
};

export default userRouter;
