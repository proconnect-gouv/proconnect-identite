import { Router, urlencoded } from "express";
import nocache from "nocache";
import { HOST } from "../config/env";
import {
  getJoinOrganizationConfirmController,
  getJoinOrganizationController,
  getOrganizationSuggestionsController,
  getUnableToAutoJoinOrganizationController,
  postJoinOrganizationMiddleware,
  postQuitUserOrganizationController,
} from "../controllers/organization";
import { postSignInWithAuthenticatorAppController } from "../controllers/totp";
import { get2faSignInController } from "../controllers/user/2fa-sign-in";
import { postDeleteUserController } from "../controllers/user/delete";
import { postCancelModerationAndRedirectControllerFactory } from "../controllers/user/edit-moderation";
import {
  getFranceConnectLogoutCallbackControllerFactory,
  getFranceConnectOidcCallbackToUpdateUserMiddleware,
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
  getSignInWithPasskeyController,
  postVerifyFirstFactorAuthenticationController,
  postVerifySecondFactorAuthenticationController,
} from "../controllers/webauthn";
import { csrfProtectionMiddleware } from "../middlewares/csrf-protection";
import {
  authenticatorRateLimiterMiddleware,
  passwordRateLimiterMiddleware,
  rateLimiterMiddleware,
  resetPasswordRateLimiterMiddleware,
  sendMagicLinkRateLimiterMiddleware,
} from "../middlewares/rate-limiter";
import {
  checkCredentialPromptRequirementsMiddleware,
  checkEmailInSessionMiddleware,
  checkIsUser,
  checkUserCanAccessAdminMiddleware,
  checkUserCanAccessAppMiddleware,
  checkUserHasAtLeastOneOrganizationMiddleware,
  checkUserHasPersonalInformationsMiddleware,
  checkUserHasSelectedAnOrganizationMiddleware,
  checkUserIsConnectedMiddleware,
  checkUserIsVerifiedMiddleware,
  checkUserSignInRequirementsMiddleware,
  checkUserTwoFactorAuthMiddleware,
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
    "/2fa-sign-in",
    checkUserIsConnectedMiddleware,
    csrfProtectionMiddleware,
    get2faSignInController,
  );
  userRouter.post(
    "/2fa-sign-in-with-authenticator-app",
    checkUserIsConnectedMiddleware,
    csrfProtectionMiddleware,
    authenticatorRateLimiterMiddleware,
    postSignInWithAuthenticatorAppController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );
  userRouter.post(
    "/2fa-sign-in-with-passkey",
    checkUserIsConnectedMiddleware,
    csrfProtectionMiddleware,
    postVerifySecondFactorAuthenticationController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/verify-email",
    checkUserTwoFactorAuthMiddleware,
    csrfProtectionMiddleware,
    getVerifyEmailController,
  );
  userRouter.post(
    "/verify-email",
    checkUserTwoFactorAuthMiddleware,
    csrfProtectionMiddleware,
    postVerifyEmailController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/send-email-verification",
    checkUserTwoFactorAuthMiddleware,
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
  userRouter.get(
    "/reset-password",
    csrfProtectionMiddleware,
    getResetPasswordController,
  );
  userRouter.post(
    "/reset-password",
    csrfProtectionMiddleware,
    resetPasswordRateLimiterMiddleware,
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
    checkUserIsVerifiedMiddleware,
    csrfProtectionMiddleware,
    getPersonalInformationsController,
  );
  userRouter.post(
    "/personal-information",
    checkUserIsVerifiedMiddleware,
    csrfProtectionMiddleware,
    postPersonalInformationsController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );
  userRouter.post(
    "/personal-information/franceconnect/login",
    checkUserIsVerifiedMiddleware,
    csrfProtectionMiddleware,
    postFranceConnectLoginRedirectControllerFactory(
      `${HOST}/users/personal-information/franceconnect/login/callback`,
    ),
  );
  userRouter.get(
    "/personal-information/franceconnect/login/callback",
    checkUserIsVerifiedMiddleware,
    getFranceConnectOidcCallbackToUpdateUserMiddleware,
    useFranceConnectLogoutMiddlewareFactory(
      `${HOST}/users/personal-information/franceconnect/logout/callback`,
    ),
  );
  userRouter.get(
    "/personal-information/franceconnect/logout/callback",
    checkUserIsVerifiedMiddleware,
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
    "/unable-to-auto-join-organization",
    checkUserHasPersonalInformationsMiddleware,
    csrfProtectionMiddleware,
    getUnableToAutoJoinOrganizationController,
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

  userRouter.get(
    "/delete",
    checkUserCanAccessAdminMiddleware,
    csrfProtectionMiddleware,
    useFranceConnectLogoutMiddlewareFactory(
      `${HOST}/users/delete/franceconnect/logout/callback`,
    ),
    postDeleteUserController,
  );
  userRouter.get(
    "/delete/franceconnect/logout/callback",
    checkUserCanAccessAdminMiddleware,
    getFranceConnectLogoutCallbackControllerFactory(`${HOST}/users/delete`),
  );

  userRouter.get(
    "/franceconnect/logout/callback",
    checkUserCanAccessAdminMiddleware,
    getFranceConnectLogoutCallbackControllerFactory(`${HOST}/oauth/logout`),
  );

  return userRouter;
};

export default userRouter;
