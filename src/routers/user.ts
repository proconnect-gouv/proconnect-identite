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
import { getOfficialContactAskWhichEmailController } from "../controllers/user/official-contact-ask-which-email";
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
  browserIsTrustedGuardMiddleware,
  credentialPromptRequirementsGuardMiddleware,
  emailInSessionGuardMiddleware,
  isUserGuardMiddleware,
  userCanAccessAdminGuardMiddleware,
  userCanAccessAppGuardMiddleware,
  userHasAtLeastOneOrganizationGuardMiddleware,
  userHasConnectedRecentlyGuardMiddleware,
  userHasSelectedAnOrganizationGuardMiddleware,
  userIsConnectedGuardMiddleware,
  userIsVerifiedGuardMiddleware,
  userSignInRequirementsGuardMiddleware,
} from "../middlewares/navigation-guards";
import {
  authenticatorRateLimiterMiddleware,
  officialContactEmailVerificationRateLimiterMiddleware,
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
    isUserGuardMiddleware,
    csrfProtectionMiddleware,
    getStartSignInController,
  );
  userRouter.post(
    "/start-sign-in",
    isUserGuardMiddleware,
    csrfProtectionMiddleware,
    postStartSignInController,
  );

  userRouter.get(
    "/inclusionconnect-welcome",
    emailInSessionGuardMiddleware,
    csrfProtectionMiddleware,
    getInclusionconnectWelcomeController,
  );
  userRouter.post(
    "/inclusionconnect-welcome",
    emailInSessionGuardMiddleware,
    csrfProtectionMiddleware,
    postInclusionconnectWelcomeController,
  );
  userRouter.get(
    "/sign-in",
    credentialPromptRequirementsGuardMiddleware,
    csrfProtectionMiddleware,
    getSignInController,
  );
  userRouter.post(
    "/sign-in",
    credentialPromptRequirementsGuardMiddleware,
    csrfProtectionMiddleware,
    passwordRateLimiterMiddleware,
    postSignInMiddleware,
    userSignInRequirementsGuardMiddleware,
    issueSessionOrRedirectController,
  );
  userRouter.get(
    "/sign-up",
    credentialPromptRequirementsGuardMiddleware,
    csrfProtectionMiddleware,
    getSignUpController,
  );
  userRouter.post(
    "/sign-up",
    credentialPromptRequirementsGuardMiddleware,
    csrfProtectionMiddleware,
    postSignUpController,
    userSignInRequirementsGuardMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/double-authentication-choice",
    userHasConnectedRecentlyGuardMiddleware,
    csrfProtectionMiddleware,
    getTwoFactorsAuthenticationChoiceController,
  );

  userRouter.get(
    "/is-totp-app-installed",
    userHasConnectedRecentlyGuardMiddleware,
    csrfProtectionMiddleware,
    getIsTotpAppInstalledController,
  );

  userRouter.get(
    "/totp-configuration",
    userHasConnectedRecentlyGuardMiddleware,
    csrfProtectionMiddleware,
    getTotpConfigurationController,
  );

  userRouter.post(
    "/totp-configuration",
    userHasConnectedRecentlyGuardMiddleware,
    csrfProtectionMiddleware,
    authenticatorRateLimiterMiddleware,
    postTotpConfigurationController,
  );

  userRouter.get(
    "/2fa-successfully-configured",
    userHasConnectedRecentlyGuardMiddleware,
    csrfProtectionMiddleware,
    get2faSuccessfullyConfiguredController,
  );

  userRouter.post(
    "/2fa-successfully-configured",
    userHasConnectedRecentlyGuardMiddleware,
    csrfProtectionMiddleware,
    post2faSuccessfullyConfiguredMiddleware,
    userSignInRequirementsGuardMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/2fa-sign-in",
    userIsVerifiedGuardMiddleware,
    csrfProtectionMiddleware,
    get2faSignInController,
  );

  userRouter.post(
    "/2fa-sign-in-with-totp",
    userIsVerifiedGuardMiddleware,
    csrfProtectionMiddleware,
    authenticatorRateLimiterMiddleware,
    postSignInWithTotpController,
    userSignInRequirementsGuardMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/2fa-sign-in-with-passkey",
    userIsVerifiedGuardMiddleware,
    csrfProtectionMiddleware,
    postVerifySecondFactorAuthenticationController,
    userSignInRequirementsGuardMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/verify-email",
    userIsConnectedGuardMiddleware,
    csrfProtectionMiddleware,
    getVerifyEmailController,
    userSignInRequirementsGuardMiddleware,
    issueSessionOrRedirectController,
  );
  userRouter.post(
    "/verify-email",
    userIsConnectedGuardMiddleware,
    csrfProtectionMiddleware,
    verifyEmailRateLimiterMiddleware,
    postVerifyEmailController,
    userSignInRequirementsGuardMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/send-email-verification",
    userIsConnectedGuardMiddleware,
    csrfProtectionMiddleware,
    postSendEmailVerificationController,
    userSignInRequirementsGuardMiddleware,
    issueSessionOrRedirectController,
  );
  userRouter.post(
    "/send-magic-link",
    credentialPromptRequirementsGuardMiddleware,
    csrfProtectionMiddleware,
    sendMagicLinkRateLimiterMiddleware,
    postSendMagicLinkController,
    userSignInRequirementsGuardMiddleware,
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
    userSignInRequirementsGuardMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/sign-in-with-passkey",
    credentialPromptRequirementsGuardMiddleware,
    csrfProtectionMiddleware,
    postVerifyFirstFactorAuthenticationController,
    userSignInRequirementsGuardMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/passkeys/verify-registration",
    userHasConnectedRecentlyGuardMiddleware,
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
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    getPersonalInformationsController,
  );
  userRouter.post(
    "/personal-information",
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    postPersonalInformationsController,
    userSignInRequirementsGuardMiddleware,
    issueSessionOrRedirectController,
  );
  userRouter.post(
    "/personal-information/franceconnect/login",
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    postFranceConnectLoginRedirectControllerFactory(
      `${HOST}/users/personal-information/franceconnect/login/callback`,
    ),
  );
  userRouter.get(
    "/personal-information/franceconnect/login/callback",
    userCanAccessAppGuardMiddleware,
    getFranceConnectLoginCallbackMiddlewareFactory(
      `${HOST}/personal-information`,
    ),
    useFranceConnectLogoutMiddlewareFactory(
      `${HOST}/users/personal-information/franceconnect/logout/callback`,
    ),
  );
  userRouter.get(
    "/personal-information/franceconnect/logout/callback",
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    getFranceConnectLogoutCallbackMiddleware,
    (_req, res) =>
      res.redirect(
        "/personal-information?notification=personal_information_update_via_franceconnect_success",
      ),
  );

  userRouter.get(
    "/organization-suggestions",
    browserIsTrustedGuardMiddleware,
    csrfProtectionMiddleware,
    getOrganizationSuggestionsController,
  );

  userRouter.get(
    "/join-organization",
    browserIsTrustedGuardMiddleware,
    csrfProtectionMiddleware,
    getJoinOrganizationController,
  );
  userRouter.post(
    "/join-organization",
    browserIsTrustedGuardMiddleware,
    csrfProtectionMiddleware,
    postJoinOrganizationMiddleware,
    userSignInRequirementsGuardMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/join-organization-confirm",
    browserIsTrustedGuardMiddleware,
    csrfProtectionMiddleware,
    getJoinOrganizationConfirmController,
  );

  userRouter.get(
    "/domain-not-allowed-for-organization",
    browserIsTrustedGuardMiddleware,
    csrfProtectionMiddleware,
    getDomainNotAllowedForOrganizationController,
  );

  userRouter.get(
    "/domain-refused-for-organization",
    browserIsTrustedGuardMiddleware,
    csrfProtectionMiddleware,
    getDomainRefusedForOrganizationController,
  );

  userRouter.get(
    "/unable-to-auto-join-organization",
    browserIsTrustedGuardMiddleware,
    csrfProtectionMiddleware,
    getUnableToAutoJoinOrganizationController,
  );
  userRouter.get(
    "/moderation-rejected",
    browserIsTrustedGuardMiddleware,
    csrfProtectionMiddleware,
    getModerationRejectedController,
  );
  userRouter.get(
    "/access-restricted-to-public-sector-email",
    browserIsTrustedGuardMiddleware,
    csrfProtectionMiddleware,
    getAccessRestrictedToPublicSectorEmailController,
  );

  userRouter.get(
    "/access-restricted-to-private-sector-email",
    browserIsTrustedGuardMiddleware,
    csrfProtectionMiddleware,
    getAccessRestrictedToPrivateSectorEmailController,
  );

  userRouter.post(
    "/cancel-moderation-and-redirect-to-sign-in/:moderation_id",
    browserIsTrustedGuardMiddleware,
    csrfProtectionMiddleware,
    postCancelModerationAndRedirectControllerFactory("/users/start-sign-in"),
  );

  userRouter.post(
    "/cancel-moderation-and-redirect-to-join-org/:moderation_id",
    browserIsTrustedGuardMiddleware,
    csrfProtectionMiddleware,
    postCancelModerationAndRedirectControllerFactory(
      "/users/join-organization",
    ),
  );

  userRouter.post(
    "/cancel-moderation-and-redirect-to-personal-information/:moderation_id",
    browserIsTrustedGuardMiddleware,
    csrfProtectionMiddleware,
    postCancelModerationAndRedirectControllerFactory(
      "/users/personal-information",
    ),
  );
  userRouter.post(
    "/reopen-moderation/:moderation_id",
    browserIsTrustedGuardMiddleware,
    csrfProtectionMiddleware,
    postReopenModerationAndRedirectControllerFactory(
      "/users/personal-information",
    ),
  );

  userRouter.get(
    "/select-organization",
    userHasAtLeastOneOrganizationGuardMiddleware,
    csrfProtectionMiddleware,
    getSelectOrganizationController,
  );

  userRouter.post(
    "/select-organization",
    userHasAtLeastOneOrganizationGuardMiddleware,
    csrfProtectionMiddleware,
    postSelectOrganizationMiddleware,
    userSignInRequirementsGuardMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/official-contact-ask-which-email/:organization_id",
    userHasSelectedAnOrganizationGuardMiddleware,
    csrfProtectionMiddleware,
    getOfficialContactAskWhichEmailController,
  );

  userRouter.get(
    "/official-contact-email-verification/:organization_id",
    userHasSelectedAnOrganizationGuardMiddleware,
    csrfProtectionMiddleware,
    officialContactEmailVerificationRateLimiterMiddleware,
    getOfficialContactEmailVerificationController,
  );

  userRouter.post(
    "/official-contact-email-verification/:organization_id",
    userHasSelectedAnOrganizationGuardMiddleware,
    csrfProtectionMiddleware,
    postOfficialContactEmailVerificationMiddleware,
    userSignInRequirementsGuardMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/welcome",
    userSignInRequirementsGuardMiddleware,
    csrfProtectionMiddleware,
    getWelcomeController,
  );
  userRouter.get(
    "/welcome/dirigeant",
    userSignInRequirementsGuardMiddleware,
    csrfProtectionMiddleware,
    getWelcomeDirigeantController,
  );

  userRouter.post(
    "/welcome",
    userSignInRequirementsGuardMiddleware,
    csrfProtectionMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/quit-organization/:id",
    userHasAtLeastOneOrganizationGuardMiddleware,
    csrfProtectionMiddleware,
    postQuitUserOrganizationController,
  );

  userRouter.post(
    "/cancel-moderation/:moderation_id",
    browserIsTrustedGuardMiddleware,
    csrfProtectionMiddleware,
    postCancelModerationAndRedirectControllerFactory(
      "/manage-organizations?notification=cancel_moderation_success",
    ),
  );

  userRouter.post(
    "/delete",
    userCanAccessAdminGuardMiddleware,
    csrfProtectionMiddleware,
    postDeleteUserController,
  );

  userRouter.get(
    "/franceconnect",
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    getFranceConnectController,
  );

  userRouter.post(
    "/franceconnect/login",
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    postFranceConnectLoginRedirectControllerFactory(
      `${HOST}/users/franceconnect/login/callback`,
    ),
  );

  userRouter.get(
    "/franceconnect/login/callback",
    userCanAccessAppGuardMiddleware,
    getFranceConnectLoginCallbackMiddlewareFactory(
      `${HOST}/users/franceconnect`,
    ),
    useFranceConnectLogoutMiddlewareFactory(
      `${HOST}/users/franceconnect/logout/callback`,
    ),
  );

  userRouter.get(
    "/franceconnect/logout/callback",
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    getFranceConnectLogoutCallbackMiddleware,
    userSignInRequirementsGuardMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/certification-dirigeant/organization-not-covered-error",
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    getCertificationDirigeantOrganizationNotCoveredError,
  );

  userRouter.get(
    "/certification-dirigeant/close-match-error",
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    getCertificationDirigeantCloseMatchError,
  );

  userRouter.get(
    "/certification-dirigeant/no-match-error",
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    getCertificationDirigeantNoMatchError,
  );

  return userRouter;
};

export default userRouter;
