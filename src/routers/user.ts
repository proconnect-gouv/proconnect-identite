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
import {
  guard,
  navigationGuardChain,
  requireBrowserIsTrusted,
  requireUserCanAccessAdmin,
  requireUserHasAtLeastOneOrganization,
  requireUserHasConnectedRecently,
  requireUserHasSelectedAnOrganization,
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
    ...navigationGuardChain(requireUserSignInRequirements),
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
    ...navigationGuardChain(requireUserSignInRequirements),
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/double-authentication-choice",
    ...navigationGuardChain(requireUserHasConnectedRecently),
    csrfProtectionMiddleware,
    getTwoFactorsAuthenticationChoiceController,
  );

  userRouter.get(
    "/is-totp-app-installed",
    ...navigationGuardChain(requireUserHasConnectedRecently),
    csrfProtectionMiddleware,
    getIsTotpAppInstalledController,
  );

  userRouter.get(
    "/totp-configuration",
    ...navigationGuardChain(requireUserHasConnectedRecently),
    csrfProtectionMiddleware,
    getTotpConfigurationController,
  );

  userRouter.post(
    "/totp-configuration",
    ...navigationGuardChain(requireUserHasConnectedRecently),
    authenticatorRateLimiterMiddleware,
    csrfProtectionMiddleware,
    postTotpConfigurationController,
  );

  userRouter.get(
    "/2fa-successfully-configured",
    ...navigationGuardChain(requireUserHasConnectedRecently),
    csrfProtectionMiddleware,
    get2faSuccessfullyConfiguredController,
  );

  userRouter.post(
    "/2fa-successfully-configured",
    ...navigationGuardChain(requireUserHasConnectedRecently),
    csrfProtectionMiddleware,
    post2faSuccessfullyConfiguredMiddleware,
    ...navigationGuardChain(requireUserSignInRequirements),
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/2fa-sign-in",
    ...navigationGuardChain(requireUserIsVerified),
    csrfProtectionMiddleware,
    get2faSignInController,
  );

  userRouter.post(
    "/2fa-sign-in-with-totp",
    ...navigationGuardChain(requireUserIsVerified),
    csrfProtectionMiddleware,
    authenticatorRateLimiterMiddleware,
    postSignInWithTotpController,
    ...navigationGuardChain(requireUserSignInRequirements),
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/2fa-sign-in-with-passkey",
    ...navigationGuardChain(requireUserIsVerified),
    csrfProtectionMiddleware,
    postVerifySecondFactorAuthenticationController,
    ...navigationGuardChain(requireUserSignInRequirements),
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
    ...navigationGuardChain(requireUserSignInRequirements),
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
    ...navigationGuardChain(requireUserSignInRequirements),
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
    ...navigationGuardChain(requireUserSignInRequirements),
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/sign-in-with-passkey",
    guard.credentialPromptReady,
    csrfProtectionMiddleware,
    postVerifyFirstFactorAuthenticationController,
    ...navigationGuardChain(requireUserSignInRequirements),
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/passkeys/verify-registration",
    ...navigationGuardChain(requireUserHasConnectedRecently),
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
    ...navigationGuardChain(requireBrowserIsTrusted),
    csrfProtectionMiddleware,
    getPersonalInformationsController,
  );
  userRouter.post(
    "/personal-information",
    ...navigationGuardChain(requireBrowserIsTrusted),
    csrfProtectionMiddleware,
    postPersonalInformationsController,
    ...navigationGuardChain(requireUserSignInRequirements),
    issueSessionOrRedirectController,
  );
  userRouter.post(
    "/personal-information/franceconnect/login",
    ...navigationGuardChain(requireBrowserIsTrusted),
    csrfProtectionMiddleware,
    postFranceConnectLoginRedirectControllerFactory(
      `${HOST}/users/personal-information/franceconnect/login/callback`,
    ),
  );
  userRouter.get(
    "/personal-information/franceconnect/login/callback",
    ...navigationGuardChain(requireBrowserIsTrusted),
    getFranceConnectLoginCallbackMiddlewareFactory(
      `${HOST}/personal-information`,
    ),
    useFranceConnectLogoutMiddlewareFactory(
      `${HOST}/users/personal-information/franceconnect/logout/callback`,
    ),
  );
  userRouter.get(
    "/personal-information/franceconnect/logout/callback",
    ...navigationGuardChain(requireBrowserIsTrusted),
    csrfProtectionMiddleware,
    getFranceConnectLogoutCallbackMiddleware,
    (_req, res) =>
      res.redirect(
        "/personal-information?notification=personal_information_update_via_franceconnect_success",
      ),
  );

  userRouter.get(
    "/organization-suggestions",
    ...navigationGuardChain(requireBrowserIsTrusted),
    csrfProtectionMiddleware,
    getOrganizationSuggestionsController,
  );

  userRouter.get(
    "/join-organization",
    ...navigationGuardChain(requireBrowserIsTrusted),
    csrfProtectionMiddleware,
    getJoinOrganizationController,
  );
  userRouter.post(
    "/join-organization",
    ...navigationGuardChain(requireBrowserIsTrusted),
    csrfProtectionMiddleware,
    postJoinOrganizationMiddleware,
    ...navigationGuardChain(requireUserSignInRequirements),
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/join-organization-confirm",
    ...navigationGuardChain(requireBrowserIsTrusted),
    csrfProtectionMiddleware,
    getJoinOrganizationConfirmController,
  );

  userRouter.get(
    "/domains-restricted-in-organization",
    ...navigationGuardChain(requireBrowserIsTrusted),
    csrfProtectionMiddleware,
    getDomainsRestrictedInOrganizationController,
  );

  userRouter.get(
    "/unable-to-auto-join-organization",
    ...navigationGuardChain(requireBrowserIsTrusted),
    csrfProtectionMiddleware,
    getUnableToAutoJoinOrganizationController,
  );
  userRouter.get(
    "/moderation-rejected",
    ...navigationGuardChain(requireBrowserIsTrusted),
    csrfProtectionMiddleware,
    getModerationRejectedController,
  );
  userRouter.get(
    "/access-restricted-to-public-sector-email",
    ...navigationGuardChain(requireBrowserIsTrusted),
    csrfProtectionMiddleware,
    getAccessRestrictedToPublicSectorEmailController,
  );

  userRouter.get(
    "/access-restricted-to-private-sector-email",
    ...navigationGuardChain(requireBrowserIsTrusted),
    csrfProtectionMiddleware,
    getAccessRestrictedToPrivateSectorEmailController,
  );

  userRouter.post(
    "/cancel-moderation-and-redirect-to-sign-in/:moderation_id",
    ...navigationGuardChain(requireBrowserIsTrusted),
    csrfProtectionMiddleware,
    postCancelModerationAndRedirectControllerFactory("/users/start-sign-in"),
  );

  userRouter.post(
    "/cancel-moderation-and-redirect-to-join-org/:moderation_id",
    ...navigationGuardChain(requireBrowserIsTrusted),
    csrfProtectionMiddleware,
    postCancelModerationAndRedirectControllerFactory(
      "/users/join-organization",
    ),
  );

  userRouter.post(
    "/cancel-moderation-and-redirect-to-personal-information/:moderation_id",
    ...navigationGuardChain(requireBrowserIsTrusted),
    csrfProtectionMiddleware,
    postCancelModerationAndRedirectControllerFactory(
      "/users/personal-information",
    ),
  );
  userRouter.post(
    "/reopen-moderation/:moderation_id",
    ...navigationGuardChain(requireBrowserIsTrusted),
    csrfProtectionMiddleware,
    postReopenModerationAndRedirectControllerFactory(
      "/users/personal-information",
    ),
  );

  userRouter.get(
    "/select-organization",
    ...navigationGuardChain(requireUserHasAtLeastOneOrganization),
    csrfProtectionMiddleware,
    getSelectOrganizationController,
  );

  userRouter.post(
    "/select-organization",
    ...navigationGuardChain(requireUserHasAtLeastOneOrganization),
    csrfProtectionMiddleware,
    postSelectOrganizationMiddleware,
    ...navigationGuardChain(requireUserSignInRequirements),
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/official-contact-email-verification/:organization_id",
    ...navigationGuardChain(requireUserHasSelectedAnOrganization),
    csrfProtectionMiddleware,
    getOfficialContactEmailVerificationController,
  );

  userRouter.post(
    "/official-contact-email-verification/:organization_id",
    ...navigationGuardChain(requireUserHasSelectedAnOrganization),
    csrfProtectionMiddleware,
    postOfficialContactEmailVerificationMiddleware,
    ...navigationGuardChain(requireUserSignInRequirements),
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/welcome",
    ...navigationGuardChain(requireUserSignInRequirements),
    csrfProtectionMiddleware,
    getWelcomeController,
  );
  userRouter.get(
    "/welcome/dirigeant",
    ...navigationGuardChain(requireUserSignInRequirements),
    csrfProtectionMiddleware,
    getWelcomeDirigeantController,
  );

  userRouter.post(
    "/welcome",
    ...navigationGuardChain(requireUserSignInRequirements),
    csrfProtectionMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/quit-organization/:id",
    ...navigationGuardChain(requireUserHasAtLeastOneOrganization),
    csrfProtectionMiddleware,
    postQuitUserOrganizationController,
  );

  userRouter.post(
    "/cancel-moderation/:moderation_id",
    ...navigationGuardChain(requireBrowserIsTrusted),
    csrfProtectionMiddleware,
    postCancelModerationAndRedirectControllerFactory(
      "/manage-organizations?notification=cancel_moderation_success",
    ),
  );

  userRouter.post(
    "/delete",
    ...navigationGuardChain(requireUserCanAccessAdmin),
    csrfProtectionMiddleware,
    postDeleteUserController,
  );

  userRouter.get(
    "/franceconnect/logout/callback",
    ...navigationGuardChain(requireUserCanAccessAdmin),
    getFranceConnectLogoutCallbackMiddleware,
    (_req, res) => res.redirect("/oauth/logout"),
  );

  userRouter.get(
    "/certification-dirigeant",
    ...navigationGuardChain(requireBrowserIsTrusted),
    csrfProtectionMiddleware,
    getCertificationDirigeantController,
  );

  userRouter.post(
    "/certification-dirigeant/franceconnect/login",
    ...navigationGuardChain(requireBrowserIsTrusted),
    csrfProtectionMiddleware,
    postFranceConnectLoginRedirectControllerFactory(
      `${HOST}/users/certification-dirigeant/franceconnect/login/callback`,
    ),
  );

  userRouter.get(
    "/certification-dirigeant/franceconnect/login/callback",
    ...navigationGuardChain(requireBrowserIsTrusted),
    getFranceConnectLoginCallbackMiddlewareFactory(
      `${HOST}/users/certification-dirigeant`,
    ),
    useFranceConnectLogoutMiddlewareFactory(
      `${HOST}/users/certification-dirigeant/franceconnect/logout/callback`,
    ),
  );

  userRouter.get(
    "/certification-dirigeant/franceconnect/logout/callback",
    ...navigationGuardChain(requireBrowserIsTrusted),
    csrfProtectionMiddleware,
    getFranceConnectLogoutCallbackMiddleware,
    ...navigationGuardChain(requireUserSignInRequirements),
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/certification-dirigeant/organization-not-covered-error",
    ...navigationGuardChain(requireBrowserIsTrusted),
    csrfProtectionMiddleware,
    getCertificationDirigeantOrganizationNotCoveredError,
  );

  userRouter.get(
    "/certification-dirigeant/close-match-error",
    ...navigationGuardChain(requireBrowserIsTrusted),
    csrfProtectionMiddleware,
    getCertificationDirigeantCloseMatchError,
  );

  userRouter.get(
    "/certification-dirigeant/no-match-error",
    ...navigationGuardChain(requireBrowserIsTrusted),
    csrfProtectionMiddleware,
    getCertificationDirigeantNoMatchError,
  );

  return userRouter;
};

export default userRouter;
