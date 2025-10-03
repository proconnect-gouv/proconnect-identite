import { Router, urlencoded } from "express";
import nocache from "nocache";
import { HOST } from "../config/env";
import {
  getAccessRestrictedToPublicSectorEmailController,
  getDomainsRestrictedInOrganizationController,
  getJoinOrganizationConfirmController,
  getJoinOrganizationController,
  getModerationRejectedController,
  getOrganizationSuggestionsController,
  getUnableToAutoJoinOrganizationController,
  getUnableToCertifyUserAsExecutiveController,
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
  getFranceConnectLoginCallbackMiddleware,
  getFranceConnectLogoutCallbackControllerFactory,
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
  getSignInWithPasskeyController,
  postVerifyFirstFactorAuthenticationController,
  postVerifyRegistrationControllerFactory,
  postVerifySecondFactorAuthenticationController,
} from "../controllers/webauthn";
import { csrfProtectionMiddleware } from "../middlewares/csrf-protection";
import {
  authenticatorRateLimiterMiddleware,
  passwordRateLimiterMiddleware,
  rateLimiterMiddleware,
  sendMagicLinkRateLimiterMiddleware,
  verifyEmailRateLimiterMiddleware,
} from "../middlewares/rate-limiter";
import {
  checkBrowserIsTrustedMiddleware,
  checkCredentialPromptRequirementsMiddleware,
  checkEmailInSessionMiddleware,
  checkIsUser,
  checkUserCanAccessAdminMiddleware,
  checkUserCanAccessAppMiddleware,
  checkUserHasAtLeastOneOrganizationMiddleware,
  checkUserHasConnectedRecentlyMiddleware,
  checkUserHasPersonalInformationsMiddleware,
  checkUserHasSelectedAnOrganizationMiddleware,
  checkUserIsConnectedMiddleware,
  checkUserIsVerifiedMiddleware,
  checkUserSignInRequirementsMiddleware,
} from "../middlewares/user";

export const userRouter = () => {
  const userRouter = Router();

  userRouter.use(nocache());

  userRouter.use(urlencoded({ extended: false }));

  userRouter.use(rateLimiterMiddleware);

  userRouter.get(
    "/start-sign-in",
    checkIsUser,
    csrfProtectionMiddleware,
    getStartSignInController,
  );
  userRouter.post(
    "/start-sign-in",
    checkIsUser,
    csrfProtectionMiddleware,
    postStartSignInController,
  );

  userRouter.get(
    "/inclusionconnect-welcome",
    checkEmailInSessionMiddleware,
    csrfProtectionMiddleware,
    getInclusionconnectWelcomeController,
  );
  userRouter.post(
    "/inclusionconnect-welcome",
    checkEmailInSessionMiddleware,
    csrfProtectionMiddleware,
    postInclusionconnectWelcomeController,
  );
  userRouter.get(
    "/sign-in",
    checkCredentialPromptRequirementsMiddleware,
    csrfProtectionMiddleware,
    getSignInController,
  );
  userRouter.post(
    "/sign-in",
    checkCredentialPromptRequirementsMiddleware,
    csrfProtectionMiddleware,
    passwordRateLimiterMiddleware,
    postSignInMiddleware,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );
  userRouter.get(
    "/sign-up",
    checkCredentialPromptRequirementsMiddleware,
    csrfProtectionMiddleware,
    getSignUpController,
  );
  userRouter.post(
    "/sign-up",
    checkCredentialPromptRequirementsMiddleware,
    csrfProtectionMiddleware,
    postSignUpController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/double-authentication-choice",
    checkUserHasConnectedRecentlyMiddleware,
    csrfProtectionMiddleware,
    getTwoFactorsAuthenticationChoiceController,
  );

  userRouter.get(
    "/is-totp-app-installed",
    checkUserHasConnectedRecentlyMiddleware,
    csrfProtectionMiddleware,
    getIsTotpAppInstalledController,
  );

  userRouter.get(
    "/totp-configuration",
    checkUserHasConnectedRecentlyMiddleware,
    csrfProtectionMiddleware,
    getTotpConfigurationController,
  );

  userRouter.post(
    "/totp-configuration",
    checkUserHasConnectedRecentlyMiddleware,
    authenticatorRateLimiterMiddleware,
    csrfProtectionMiddleware,
    postTotpConfigurationController,
  );

  userRouter.get(
    "/2fa-successfully-configured",
    checkUserHasConnectedRecentlyMiddleware,
    csrfProtectionMiddleware,
    get2faSuccessfullyConfiguredController,
  );

  userRouter.post(
    "/2fa-successfully-configured",
    checkUserHasConnectedRecentlyMiddleware,
    csrfProtectionMiddleware,
    post2faSuccessfullyConfiguredMiddleware,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/2fa-sign-in",
    checkUserIsVerifiedMiddleware,
    csrfProtectionMiddleware,
    get2faSignInController,
  );

  userRouter.post(
    "/2fa-sign-in-with-totp",
    checkUserIsVerifiedMiddleware,
    csrfProtectionMiddleware,
    authenticatorRateLimiterMiddleware,
    postSignInWithTotpController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/2fa-sign-in-with-passkey",
    checkUserIsVerifiedMiddleware,
    csrfProtectionMiddleware,
    postVerifySecondFactorAuthenticationController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/verify-email",
    checkUserIsConnectedMiddleware,
    csrfProtectionMiddleware,
    getVerifyEmailController,
  );
  userRouter.post(
    "/verify-email",
    checkUserIsConnectedMiddleware,
    csrfProtectionMiddleware,
    verifyEmailRateLimiterMiddleware,
    postVerifyEmailController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/send-email-verification",
    checkUserIsConnectedMiddleware,
    csrfProtectionMiddleware,
    postSendEmailVerificationController,
  );
  userRouter.post(
    "/send-magic-link",
    checkCredentialPromptRequirementsMiddleware,
    csrfProtectionMiddleware,
    sendMagicLinkRateLimiterMiddleware,
    postSendMagicLinkController,
    checkUserSignInRequirementsMiddleware,
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
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );
  userRouter.get(
    "/sign-in-with-passkey",
    checkCredentialPromptRequirementsMiddleware,
    csrfProtectionMiddleware,
    getSignInWithPasskeyController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/sign-in-with-passkey",
    checkCredentialPromptRequirementsMiddleware,
    csrfProtectionMiddleware,
    postVerifyFirstFactorAuthenticationController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/passkeys/verify-registration",
    checkUserHasConnectedRecentlyMiddleware,
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
    checkBrowserIsTrustedMiddleware,
    csrfProtectionMiddleware,
    getPersonalInformationsController,
  );
  userRouter.post(
    "/personal-information",
    checkBrowserIsTrustedMiddleware,
    csrfProtectionMiddleware,
    postPersonalInformationsController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );
  userRouter.post(
    "/personal-information/franceconnect/login",
    checkBrowserIsTrustedMiddleware,
    csrfProtectionMiddleware,
    postFranceConnectLoginRedirectControllerFactory(
      `${HOST}/users/personal-information/franceconnect/login/callback`,
    ),
  );
  userRouter.get(
    "/personal-information/franceconnect/login/callback",
    checkBrowserIsTrustedMiddleware,
    getFranceConnectLoginCallbackMiddleware,
    useFranceConnectLogoutMiddlewareFactory(
      `${HOST}/users/personal-information/franceconnect/logout/callback`,
    ),
  );
  userRouter.get(
    "/personal-information/franceconnect/logout/callback",
    checkBrowserIsTrustedMiddleware,
    csrfProtectionMiddleware,
    getFranceConnectLogoutCallbackControllerFactory(
      "/personal-information?notification=personal_information_update_via_franceconnect_success",
    ),
  );

  userRouter.get(
    "/organization-suggestions",
    checkUserHasPersonalInformationsMiddleware,
    csrfProtectionMiddleware,
    getOrganizationSuggestionsController,
  );

  userRouter.get(
    "/join-organization",
    checkUserHasPersonalInformationsMiddleware,
    csrfProtectionMiddleware,
    getJoinOrganizationController,
  );
  userRouter.post(
    "/join-organization",
    checkUserHasPersonalInformationsMiddleware,
    csrfProtectionMiddleware,
    postJoinOrganizationMiddleware,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/join-organization-confirm",
    checkUserHasPersonalInformationsMiddleware,
    csrfProtectionMiddleware,
    getJoinOrganizationConfirmController,
  );

  userRouter.get(
    "/domains-restricted-in-organization",
    checkUserHasPersonalInformationsMiddleware,
    csrfProtectionMiddleware,
    getDomainsRestrictedInOrganizationController,
  );

  userRouter.get(
    "/unable-to-auto-join-organization",
    checkUserHasPersonalInformationsMiddleware,
    csrfProtectionMiddleware,
    getUnableToAutoJoinOrganizationController,
  );
  userRouter.get(
    "/moderation-rejected",
    checkUserHasPersonalInformationsMiddleware,
    csrfProtectionMiddleware,
    getModerationRejectedController,
  );
  userRouter.get(
    "/access-restricted-to-public-sector-email",
    checkUserHasPersonalInformationsMiddleware,
    csrfProtectionMiddleware,
    getAccessRestrictedToPublicSectorEmailController,
  );

  userRouter.post(
    "/cancel-moderation-and-redirect-to-sign-in/:moderation_id",
    checkUserHasPersonalInformationsMiddleware,
    csrfProtectionMiddleware,
    postCancelModerationAndRedirectControllerFactory("/users/start-sign-in"),
  );

  userRouter.post(
    "/cancel-moderation-and-redirect-to-join-org/:moderation_id",
    checkUserHasPersonalInformationsMiddleware,
    csrfProtectionMiddleware,
    postCancelModerationAndRedirectControllerFactory(
      "/users/join-organization",
    ),
  );

  userRouter.post(
    "/cancel-moderation-and-redirect-to-personal-information/:moderation_id",
    checkUserHasPersonalInformationsMiddleware,
    csrfProtectionMiddleware,
    postCancelModerationAndRedirectControllerFactory(
      "/users/personal-information",
    ),
  );
  userRouter.post(
    "/reopen-moderation/:moderation_id",
    checkUserHasPersonalInformationsMiddleware,
    csrfProtectionMiddleware,
    postReopenModerationAndRedirectControllerFactory(
      "/users/personal-information",
    ),
  );

  userRouter.get(
    "/select-organization",
    checkUserHasAtLeastOneOrganizationMiddleware,
    csrfProtectionMiddleware,
    getSelectOrganizationController,
  );

  userRouter.post(
    "/select-organization",
    checkUserHasAtLeastOneOrganizationMiddleware,
    csrfProtectionMiddleware,
    postSelectOrganizationMiddleware,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/official-contact-email-verification/:organization_id",
    checkUserHasSelectedAnOrganizationMiddleware,
    csrfProtectionMiddleware,
    getOfficialContactEmailVerificationController,
  );

  userRouter.post(
    "/official-contact-email-verification/:organization_id",
    checkUserHasSelectedAnOrganizationMiddleware,
    csrfProtectionMiddleware,
    postOfficialContactEmailVerificationMiddleware,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/welcome",
    checkUserSignInRequirementsMiddleware,
    csrfProtectionMiddleware,
    getWelcomeController,
  );
  userRouter.get(
    "/welcome/dirigeant",
    checkUserSignInRequirementsMiddleware,
    csrfProtectionMiddleware,
    getWelcomeDirigeantController,
  );

  userRouter.post(
    "/welcome",
    checkUserSignInRequirementsMiddleware,
    csrfProtectionMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/quit-organization/:id",
    checkUserCanAccessAppMiddleware,
    csrfProtectionMiddleware,
    postQuitUserOrganizationController,
  );

  userRouter.post(
    "/cancel-moderation/:moderation_id",
    checkUserHasPersonalInformationsMiddleware,
    csrfProtectionMiddleware,
    postCancelModerationAndRedirectControllerFactory(
      "/manage-organizations?notification=cancel_moderation_success",
    ),
  );

  userRouter.post(
    "/delete",
    checkUserCanAccessAdminMiddleware,
    csrfProtectionMiddleware,
    postDeleteUserController,
  );

  userRouter.get(
    "/franceconnect/logout/callback",
    checkUserCanAccessAdminMiddleware,
    getFranceConnectLogoutCallbackControllerFactory(`${HOST}/oauth/logout`),
  );

  userRouter.get(
    "/certification-dirigeant",
    checkBrowserIsTrustedMiddleware,
    csrfProtectionMiddleware,
    getCertificationDirigeantController,
  );

  userRouter.post(
    "/certification-dirigeant/franceconnect/login",
    checkBrowserIsTrustedMiddleware,
    csrfProtectionMiddleware,
    postFranceConnectLoginRedirectControllerFactory(
      `${HOST}/users/certification-dirigeant/franceconnect/login/callback`,
    ),
  );

  userRouter.get(
    "/certification-dirigeant/franceconnect/login/callback",
    checkBrowserIsTrustedMiddleware,
    getFranceConnectLoginCallbackMiddleware,
    useFranceConnectLogoutMiddlewareFactory(
      `${HOST}/users/certification-dirigeant/franceconnect/logout/callback`,
    ),
  );

  userRouter.get(
    "/certification-dirigeant/franceconnect/logout/callback",
    checkBrowserIsTrustedMiddleware,
    csrfProtectionMiddleware,
    getFranceConnectLogoutCallbackControllerFactory(
      "/users/select-organization",
    ),
  );

  userRouter.get(
    "/unable-to-certify-user-as-executive",
    checkUserHasPersonalInformationsMiddleware,
    csrfProtectionMiddleware,
    getUnableToCertifyUserAsExecutiveController,
  );

  return userRouter;
};

export default userRouter;
