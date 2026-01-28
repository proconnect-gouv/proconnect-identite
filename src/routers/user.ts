import { Router, urlencoded } from "express";
import nocache from "nocache";
import { HOST } from "../config/env";
import {
  getAccessRestrictedToPrivateSectorEmailController,
  getAccessRestrictedToPublicSectorEmailController,
  getCertificationDirigeantCloseMatchError,
  getCertificationDirigeantNoMatchError,
  getCertificationDirigeantOrganizationNotCoveredError,
  getDomainNotAllowedForOrganizationController,
  getDomainRefusedForOrganizationController,
  getJoinOrganizationConfirmController,
  getJoinOrganizationController,
  getModerationRejectedController,
  getOrganizationSuggestionsController,
  getUnableToAutoJoinOrganizationController,
  postJoinOrganizationMiddleware,
  postQuitUserOrganizationController,
} from "../controllers/organization";
import { postSignInWithTotpController } from "../controllers/totp";
import { postDeleteUserController } from "../controllers/user/delete";

import { get2faSignInController } from "../controllers/user/2fa-sign-in";
import {
  postCancelModerationAndRedirectControllerFactory,
  postReopenModerationAndRedirectControllerFactory,
} from "../controllers/user/edit-moderation";
import {
  getFranceConnectController,
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
import {
  requireBrowserIsTrusted,
  requireCredentialPromptRequirements,
  requireEmailInSession,
  requireFranceConnectForCertificationDirigeant,
  requireIsUser,
  requireUserCanAccessAdmin,
  requireUserCanAccessApp,
  requireUserHasAtLeastOneOrganization,
  requireUserHasConnectedRecently,
  requireUserHasSelectedAnOrganization,
  requireUserIsConnected,
  requireUserIsVerified,
  requireUserSignInRequirements,
} from "../middlewares/navigation-guards";
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
    requireIsUser,
    csrfProtectionMiddleware,
    getStartSignInController,
  );
  userRouter.post(
    "/start-sign-in",
    requireIsUser,
    csrfProtectionMiddleware,
    postStartSignInController,
  );

  userRouter.get(
    "/inclusionconnect-welcome",
    requireEmailInSession,
    csrfProtectionMiddleware,
    getInclusionconnectWelcomeController,
  );
  userRouter.post(
    "/inclusionconnect-welcome",
    requireEmailInSession,
    csrfProtectionMiddleware,
    postInclusionconnectWelcomeController,
  );
  userRouter.get(
    "/sign-in",
    requireCredentialPromptRequirements,
    csrfProtectionMiddleware,
    getSignInController,
  );
  userRouter.post(
    "/sign-in",
    requireCredentialPromptRequirements,
    csrfProtectionMiddleware,
    passwordRateLimiterMiddleware,
    postSignInMiddleware,
    requireUserSignInRequirements,
    issueSessionOrRedirectController,
  );
  userRouter.get(
    "/sign-up",
    requireCredentialPromptRequirements,
    csrfProtectionMiddleware,
    getSignUpController,
  );
  userRouter.post(
    "/sign-up",
    requireCredentialPromptRequirements,
    csrfProtectionMiddleware,
    postSignUpController,
    requireUserSignInRequirements,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/double-authentication-choice",
    requireUserHasConnectedRecently,
    csrfProtectionMiddleware,
    getTwoFactorsAuthenticationChoiceController,
  );

  userRouter.get(
    "/is-totp-app-installed",
    requireUserHasConnectedRecently,
    csrfProtectionMiddleware,
    getIsTotpAppInstalledController,
  );

  userRouter.get(
    "/totp-configuration",
    requireUserHasConnectedRecently,
    csrfProtectionMiddleware,
    getTotpConfigurationController,
  );

  userRouter.post(
    "/totp-configuration",
    requireUserHasConnectedRecently,
    authenticatorRateLimiterMiddleware,
    csrfProtectionMiddleware,
    postTotpConfigurationController,
  );

  userRouter.get(
    "/2fa-successfully-configured",
    requireUserHasConnectedRecently,
    csrfProtectionMiddleware,
    get2faSuccessfullyConfiguredController,
  );

  userRouter.post(
    "/2fa-successfully-configured",
    requireUserHasConnectedRecently,
    csrfProtectionMiddleware,
    post2faSuccessfullyConfiguredMiddleware,
    requireUserSignInRequirements,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/2fa-sign-in",
    requireUserIsVerified,
    csrfProtectionMiddleware,
    get2faSignInController,
  );

  userRouter.post(
    "/2fa-sign-in-with-totp",
    requireUserIsVerified,
    csrfProtectionMiddleware,
    authenticatorRateLimiterMiddleware,
    postSignInWithTotpController,
    requireUserSignInRequirements,
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/2fa-sign-in-with-passkey",
    requireUserIsVerified,
    csrfProtectionMiddleware,
    postVerifySecondFactorAuthenticationController,
    requireUserSignInRequirements,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/verify-email",
    requireUserIsConnected,
    csrfProtectionMiddleware,
    getVerifyEmailController,
    requireUserSignInRequirements,
    issueSessionOrRedirectController,
  );
  userRouter.post(
    "/verify-email",
    requireUserIsConnected,
    csrfProtectionMiddleware,
    verifyEmailRateLimiterMiddleware,
    postVerifyEmailController,
    requireUserSignInRequirements,
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/send-email-verification",
    requireUserIsConnected,
    csrfProtectionMiddleware,
    postSendEmailVerificationController,
    requireUserSignInRequirements,
    issueSessionOrRedirectController,
  );
  userRouter.post(
    "/send-magic-link",
    requireCredentialPromptRequirements,
    csrfProtectionMiddleware,
    sendMagicLinkRateLimiterMiddleware,
    postSendMagicLinkController,
    requireUserSignInRequirements,
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
    requireUserSignInRequirements,
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/sign-in-with-passkey",
    requireCredentialPromptRequirements,
    csrfProtectionMiddleware,
    postVerifyFirstFactorAuthenticationController,
    requireUserSignInRequirements,
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/passkeys/verify-registration",
    requireUserHasConnectedRecently,
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
    requireUserCanAccessApp,
    csrfProtectionMiddleware,
    getPersonalInformationsController,
  );
  userRouter.post(
    "/personal-information",
    requireUserCanAccessApp,
    csrfProtectionMiddleware,
    postPersonalInformationsController,
    requireUserSignInRequirements,
    issueSessionOrRedirectController,
  );
  userRouter.post(
    "/personal-information/franceconnect/login",
    requireFranceConnectForCertificationDirigeant,
    csrfProtectionMiddleware,
    postFranceConnectLoginRedirectControllerFactory(
      `${HOST}/users/personal-information/franceconnect/login/callback`,
    ),
  );
  userRouter.get(
    "/personal-information/franceconnect/login/callback",
    requireFranceConnectForCertificationDirigeant,
    getFranceConnectLoginCallbackMiddlewareFactory(
      `${HOST}/personal-information`,
    ),
    useFranceConnectLogoutMiddlewareFactory(
      `${HOST}/users/personal-information/franceconnect/logout/callback`,
    ),
  );
  userRouter.get(
    "/personal-information/franceconnect/logout/callback",
    requireFranceConnectForCertificationDirigeant,
    csrfProtectionMiddleware,
    getFranceConnectLogoutCallbackMiddleware,
    (_req, res) =>
      res.redirect(
        "/personal-information?notification=personal_information_update_via_franceconnect_success",
      ),
  );

  userRouter.get(
    "/organization-suggestions",
    requireBrowserIsTrusted,
    csrfProtectionMiddleware,
    getOrganizationSuggestionsController,
  );

  userRouter.get(
    "/join-organization",
    requireBrowserIsTrusted,
    csrfProtectionMiddleware,
    getJoinOrganizationController,
  );
  userRouter.post(
    "/join-organization",
    requireBrowserIsTrusted,
    csrfProtectionMiddleware,
    postJoinOrganizationMiddleware,
    requireUserSignInRequirements,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/join-organization-confirm",
    requireBrowserIsTrusted,
    csrfProtectionMiddleware,
    getJoinOrganizationConfirmController,
  );

  userRouter.get(
    "/domain-not-allowed-for-organization",
    requireBrowserIsTrusted,
    csrfProtectionMiddleware,
    getDomainNotAllowedForOrganizationController,
  );

  userRouter.get(
    "/domain-refused-for-organization",
    requireBrowserIsTrusted,
    csrfProtectionMiddleware,
    getDomainRefusedForOrganizationController,
  );

  userRouter.get(
    "/unable-to-auto-join-organization",
    requireBrowserIsTrusted,
    csrfProtectionMiddleware,
    getUnableToAutoJoinOrganizationController,
  );
  userRouter.get(
    "/moderation-rejected",
    requireBrowserIsTrusted,
    csrfProtectionMiddleware,
    getModerationRejectedController,
  );
  userRouter.get(
    "/access-restricted-to-public-sector-email",
    requireBrowserIsTrusted,
    csrfProtectionMiddleware,
    getAccessRestrictedToPublicSectorEmailController,
  );

  userRouter.get(
    "/access-restricted-to-private-sector-email",
    requireBrowserIsTrusted,
    csrfProtectionMiddleware,
    getAccessRestrictedToPrivateSectorEmailController,
  );

  userRouter.post(
    "/cancel-moderation-and-redirect-to-sign-in/:moderation_id",
    requireBrowserIsTrusted,
    csrfProtectionMiddleware,
    postCancelModerationAndRedirectControllerFactory("/users/start-sign-in"),
  );

  userRouter.post(
    "/cancel-moderation-and-redirect-to-join-org/:moderation_id",
    requireBrowserIsTrusted,
    csrfProtectionMiddleware,
    postCancelModerationAndRedirectControllerFactory(
      "/users/join-organization",
    ),
  );

  userRouter.post(
    "/cancel-moderation-and-redirect-to-personal-information/:moderation_id",
    requireBrowserIsTrusted,
    csrfProtectionMiddleware,
    postCancelModerationAndRedirectControllerFactory(
      "/users/personal-information",
    ),
  );
  userRouter.post(
    "/reopen-moderation/:moderation_id",
    requireBrowserIsTrusted,
    csrfProtectionMiddleware,
    postReopenModerationAndRedirectControllerFactory(
      "/users/personal-information",
    ),
  );

  userRouter.get(
    "/select-organization",
    requireUserHasAtLeastOneOrganization,
    csrfProtectionMiddleware,
    getSelectOrganizationController,
  );

  userRouter.post(
    "/select-organization",
    requireUserHasAtLeastOneOrganization,
    csrfProtectionMiddleware,
    postSelectOrganizationMiddleware,
    requireUserSignInRequirements,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/official-contact-email-verification/:organization_id",
    requireUserHasSelectedAnOrganization,
    csrfProtectionMiddleware,
    getOfficialContactEmailVerificationController,
  );

  userRouter.post(
    "/official-contact-email-verification/:organization_id",
    requireUserHasSelectedAnOrganization,
    csrfProtectionMiddleware,
    postOfficialContactEmailVerificationMiddleware,
    requireUserSignInRequirements,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/welcome",
    requireUserSignInRequirements,
    csrfProtectionMiddleware,
    getWelcomeController,
  );
  userRouter.get(
    "/welcome/dirigeant",
    requireUserSignInRequirements,
    csrfProtectionMiddleware,
    getWelcomeDirigeantController,
  );

  userRouter.post(
    "/welcome",
    requireUserSignInRequirements,
    csrfProtectionMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/quit-organization/:id",
    requireUserHasAtLeastOneOrganization,
    csrfProtectionMiddleware,
    postQuitUserOrganizationController,
  );

  userRouter.post(
    "/cancel-moderation/:moderation_id",
    requireBrowserIsTrusted,
    csrfProtectionMiddleware,
    postCancelModerationAndRedirectControllerFactory(
      "/manage-organizations?notification=cancel_moderation_success",
    ),
  );

  userRouter.post(
    "/delete",
    requireUserCanAccessAdmin,
    csrfProtectionMiddleware,
    postDeleteUserController,
  );

  userRouter.get(
    "/franceconnect/logout/callback",
    requireUserCanAccessAdmin,
    getFranceConnectLogoutCallbackMiddleware,
    (_req, res) => res.redirect("/oauth/logout"),
  );

  userRouter.get(
    "/franceconnect",
    requireFranceConnectForCertificationDirigeant,
    csrfProtectionMiddleware,
    getFranceConnectController,
  );

  userRouter.post(
    "/franceconnect/login",
    requireFranceConnectForCertificationDirigeant,
    csrfProtectionMiddleware,
    postFranceConnectLoginRedirectControllerFactory(
      `${HOST}/users/certification-dirigeant/franceconnect/login/callback`,
    ),
  );

  userRouter.get(
    "/certification-dirigeant/franceconnect/login/callback",
    requireFranceConnectForCertificationDirigeant,
    getFranceConnectLoginCallbackMiddlewareFactory(
      `${HOST}/users/franceconnect`,
    ),
    useFranceConnectLogoutMiddlewareFactory(
      `${HOST}/users/certification-dirigeant/franceconnect/logout/callback`,
    ),
  );

  userRouter.get(
    "/certification-dirigeant/franceconnect/logout/callback",
    requireFranceConnectForCertificationDirigeant,
    csrfProtectionMiddleware,
    getFranceConnectLogoutCallbackMiddleware,
    requireUserSignInRequirements,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/certification-dirigeant/organization-not-covered-error",
    requireFranceConnectForCertificationDirigeant,
    csrfProtectionMiddleware,
    getCertificationDirigeantOrganizationNotCoveredError,
  );

  userRouter.get(
    "/certification-dirigeant/close-match-error",
    requireFranceConnectForCertificationDirigeant,
    csrfProtectionMiddleware,
    getCertificationDirigeantCloseMatchError,
  );

  userRouter.get(
    "/certification-dirigeant/no-match-error",
    requireFranceConnectForCertificationDirigeant,
    csrfProtectionMiddleware,
    getCertificationDirigeantNoMatchError,
  );

  return userRouter;
};

export default userRouter;
