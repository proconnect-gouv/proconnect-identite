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
  getMfaDecisionHelperCanInstallSoftwareController,
  getMfaDecisionHelperCanInstallSoftwareExternalHelpNeededController,
  getMfaDecisionHelperCanInstallSoftwareSmartphoneAppController,
  getMfaDecisionHelperCanInstallSoftwareSmartphoneController,
  getMfaDecisionHelperCanInstallSoftwareSoftwareController,
  getMfaDecisionHelperController,
  getMfaDecisionHelperPasskeyController,
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
import { getWelcomeController } from "../controllers/user/welcome";
import {
  postVerifyFirstFactorAuthenticationController,
  postVerifyRegistrationControllerFactory,
  postVerifySecondFactorAuthenticationController,
} from "../controllers/webauthn";
import { csrfProtectionMiddleware } from "../middlewares/csrf-protection";
import {
  isUserGuardMiddleware,
  userCanAccessAdminGuardMiddleware,
  userCanAccessAppGuardMiddleware,
  userCanBePromptedForCredentialsGuardMiddleware,
  userCanBePromptedForMfaGuardMiddleware,
  userCanSeeInclusionConnectWelcomePageGuardMiddleware,
  userCanSelectAnOrganizationGuardMiddleware,
  userCanSetupMfaGuardMiddleware,
  userComplyWithAllRequirementsGuardMiddleware,
  userIsAuthenticatedGuardMiddleware,
} from "../middlewares/navigation-guards";
import {
  authenticatorRateLimiterMiddleware,
  officialContactEmailVerificationRateLimiterMiddleware,
  passwordRateLimiterMiddleware,
  sendEmailVerificationRateLimiterMiddleware,
  sendMagicLinkRateLimiterMiddleware,
  verifyEmailRateLimiterMiddleware,
} from "../middlewares/rate-limiter";

export const userRouter = () => {
  const userRouter = Router();

  userRouter.use(nocache());

  userRouter.use(urlencoded({ extended: false }));

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
    userCanSeeInclusionConnectWelcomePageGuardMiddleware,
    csrfProtectionMiddleware,
    getInclusionconnectWelcomeController,
  );
  userRouter.post(
    "/inclusionconnect-welcome",
    userCanSeeInclusionConnectWelcomePageGuardMiddleware,
    csrfProtectionMiddleware,
    postInclusionconnectWelcomeController,
  );
  userRouter.get(
    "/sign-in",
    userCanBePromptedForCredentialsGuardMiddleware,
    csrfProtectionMiddleware,
    getSignInController,
  );
  userRouter.post(
    "/sign-in",
    userCanBePromptedForCredentialsGuardMiddleware,
    csrfProtectionMiddleware,
    passwordRateLimiterMiddleware,
    postSignInMiddleware,
    userComplyWithAllRequirementsGuardMiddleware,
    issueSessionOrRedirectController,
  );
  userRouter.get(
    "/sign-up",
    userCanBePromptedForCredentialsGuardMiddleware,
    csrfProtectionMiddleware,
    getSignUpController,
  );
  userRouter.post(
    "/sign-up",
    userCanBePromptedForCredentialsGuardMiddleware,
    csrfProtectionMiddleware,
    postSignUpController,
    userComplyWithAllRequirementsGuardMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/double-authentication-choice",
    userCanSetupMfaGuardMiddleware,
    csrfProtectionMiddleware,
    getTwoFactorsAuthenticationChoiceController,
  );

  userRouter.get(
    "/is-totp-app-installed",
    userCanSetupMfaGuardMiddleware,
    csrfProtectionMiddleware,
    getIsTotpAppInstalledController,
  );

  userRouter.get(
    "/totp-configuration",
    userCanSetupMfaGuardMiddleware,
    csrfProtectionMiddleware,
    getTotpConfigurationController,
  );

  userRouter.post(
    "/totp-configuration",
    userCanSetupMfaGuardMiddleware,
    csrfProtectionMiddleware,
    authenticatorRateLimiterMiddleware,
    postTotpConfigurationController,
  );

  userRouter.get(
    "/2fa-successfully-configured",
    userCanSetupMfaGuardMiddleware,
    csrfProtectionMiddleware,
    get2faSuccessfullyConfiguredController,
  );

  userRouter.post(
    "/2fa-successfully-configured",
    userCanSetupMfaGuardMiddleware,
    csrfProtectionMiddleware,
    post2faSuccessfullyConfiguredMiddleware,
    userComplyWithAllRequirementsGuardMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/2fa-sign-in",
    userCanBePromptedForMfaGuardMiddleware,
    csrfProtectionMiddleware,
    get2faSignInController,
  );

  userRouter.post(
    "/2fa-sign-in-with-totp",
    userCanBePromptedForMfaGuardMiddleware,
    csrfProtectionMiddleware,
    authenticatorRateLimiterMiddleware,
    postSignInWithTotpController,
    userComplyWithAllRequirementsGuardMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/2fa-sign-in-with-passkey",
    userCanBePromptedForMfaGuardMiddleware,
    csrfProtectionMiddleware,
    postVerifySecondFactorAuthenticationController,
    userComplyWithAllRequirementsGuardMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/verify-email",
    userIsAuthenticatedGuardMiddleware,
    csrfProtectionMiddleware,
    getVerifyEmailController,
    userComplyWithAllRequirementsGuardMiddleware,
    issueSessionOrRedirectController,
  );
  userRouter.post(
    "/verify-email",
    userIsAuthenticatedGuardMiddleware,
    csrfProtectionMiddleware,
    verifyEmailRateLimiterMiddleware,
    postVerifyEmailController,
    userComplyWithAllRequirementsGuardMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/send-email-verification",
    userIsAuthenticatedGuardMiddleware,
    csrfProtectionMiddleware,
    sendEmailVerificationRateLimiterMiddleware,
    postSendEmailVerificationController,
    userComplyWithAllRequirementsGuardMiddleware,
    issueSessionOrRedirectController,
  );
  userRouter.post(
    "/send-magic-link",
    userCanBePromptedForCredentialsGuardMiddleware,
    csrfProtectionMiddleware,
    sendMagicLinkRateLimiterMiddleware,
    postSendMagicLinkController,
    userComplyWithAllRequirementsGuardMiddleware,
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
    userComplyWithAllRequirementsGuardMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/sign-in-with-passkey",
    userCanBePromptedForCredentialsGuardMiddleware,
    csrfProtectionMiddleware,
    postVerifyFirstFactorAuthenticationController,
    userComplyWithAllRequirementsGuardMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/passkeys/verify-registration",
    userCanSetupMfaGuardMiddleware,
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
    userComplyWithAllRequirementsGuardMiddleware,
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
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    getOrganizationSuggestionsController,
  );

  userRouter.get(
    "/join-organization",
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    getJoinOrganizationController,
  );
  userRouter.post(
    "/join-organization",
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    postJoinOrganizationMiddleware,
    userComplyWithAllRequirementsGuardMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/join-organization-confirm",
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    getJoinOrganizationConfirmController,
  );

  userRouter.get(
    "/domain-not-allowed-for-organization",
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    getDomainNotAllowedForOrganizationController,
  );

  userRouter.get(
    "/domain-refused-for-organization",
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    getDomainRefusedForOrganizationController,
  );

  userRouter.get(
    "/unable-to-auto-join-organization",
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    getUnableToAutoJoinOrganizationController,
  );
  userRouter.get(
    "/moderation-rejected",
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    getModerationRejectedController,
  );
  userRouter.get(
    "/access-restricted-to-public-sector-email",
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    getAccessRestrictedToPublicSectorEmailController,
  );

  userRouter.get(
    "/access-restricted-to-private-sector-email",
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    getAccessRestrictedToPrivateSectorEmailController,
  );

  userRouter.post(
    "/cancel-moderation-and-redirect-to-sign-in/:moderation_id",
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    postCancelModerationAndRedirectControllerFactory("/users/start-sign-in"),
  );

  userRouter.post(
    "/cancel-moderation-and-redirect-to-join-org/:moderation_id",
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    postCancelModerationAndRedirectControllerFactory(
      "/users/join-organization",
    ),
  );

  userRouter.post(
    "/cancel-moderation-and-redirect-to-personal-information/:moderation_id",
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    postCancelModerationAndRedirectControllerFactory(
      "/users/personal-information",
    ),
  );
  userRouter.post(
    "/reopen-moderation/:moderation_id",
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    postReopenModerationAndRedirectControllerFactory(
      "/users/personal-information",
    ),
  );

  userRouter.get(
    "/official-contact-ask-which-email",
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    getOfficialContactAskWhichEmailController,
  );

  userRouter.get(
    "/official-contact-email-verification",
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    officialContactEmailVerificationRateLimiterMiddleware,
    getOfficialContactEmailVerificationController,
  );

  userRouter.post(
    "/official-contact-email-verification",
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    officialContactEmailVerificationRateLimiterMiddleware,
    postOfficialContactEmailVerificationMiddleware,
    userComplyWithAllRequirementsGuardMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/select-organization",
    userCanSelectAnOrganizationGuardMiddleware,
    csrfProtectionMiddleware,
    getSelectOrganizationController,
  );

  userRouter.post(
    "/select-organization",
    userCanSelectAnOrganizationGuardMiddleware,
    csrfProtectionMiddleware,
    postSelectOrganizationMiddleware,
    userComplyWithAllRequirementsGuardMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/welcome",
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    getWelcomeController,
  );

  userRouter.post(
    "/welcome",
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/quit-organization/:id",
    userCanAccessAppGuardMiddleware,
    csrfProtectionMiddleware,
    postQuitUserOrganizationController,
  );

  userRouter.post(
    "/cancel-moderation/:moderation_id",
    userCanAccessAppGuardMiddleware,
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
    userComplyWithAllRequirementsGuardMiddleware,
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

  userRouter.get(
    "/mfa-decision-helper",
    userCanSetupMfaGuardMiddleware,
    csrfProtectionMiddleware,
    getMfaDecisionHelperController,
  );

  userRouter.get(
    "/mfa-decision-helper/passkey",
    userCanSetupMfaGuardMiddleware,
    csrfProtectionMiddleware,
    getMfaDecisionHelperPasskeyController,
  );

  userRouter.get(
    "/mfa-decision-helper/can-install-software",
    userCanSetupMfaGuardMiddleware,
    csrfProtectionMiddleware,
    getMfaDecisionHelperCanInstallSoftwareController,
  );

  userRouter.get(
    "/mfa-decision-helper/can-install-software/software",
    userCanSetupMfaGuardMiddleware,
    csrfProtectionMiddleware,
    getMfaDecisionHelperCanInstallSoftwareSoftwareController,
  );

  userRouter.get(
    "/mfa-decision-helper/can-install-software/external-help-needed",
    userCanSetupMfaGuardMiddleware,
    csrfProtectionMiddleware,
    getMfaDecisionHelperCanInstallSoftwareExternalHelpNeededController,
  );

  userRouter.get(
    "/mfa-decision-helper/can-install-software/smartphone",
    userCanSetupMfaGuardMiddleware,
    csrfProtectionMiddleware,
    getMfaDecisionHelperCanInstallSoftwareSmartphoneController,
  );

  userRouter.get(
    "/mfa-decision-helper/can-install-software/smartphone/app",
    userCanSetupMfaGuardMiddleware,
    csrfProtectionMiddleware,
    getMfaDecisionHelperCanInstallSoftwareSmartphoneAppController,
  );

  return userRouter;
};

export default userRouter;
