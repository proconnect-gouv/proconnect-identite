import { Router, urlencoded } from "express";
import nocache from "nocache";
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
  getFranceConnectLogoutController,
  getFranceConnectOidcCallbackController,
  postFranceConnectController,
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

  userRouter.get(
    "/start-sign-in",
    checkIsUser,
    csrfProtectionMiddleware,
    getStartSignInController,
  );
  userRouter.post(
    "/start-sign-in",
    rateLimiterMiddleware,
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
    rateLimiterMiddleware,
    checkCredentialPromptRequirementsMiddleware,
    passwordRateLimiterMiddleware,
    csrfProtectionMiddleware,
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
    rateLimiterMiddleware,
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
    authenticatorRateLimiterMiddleware,
    checkUserIsConnectedMiddleware,
    csrfProtectionMiddleware,
    postSignInWithAuthenticatorAppController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );
  userRouter.post(
    "/2fa-sign-in-with-passkey",
    rateLimiterMiddleware,
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
    rateLimiterMiddleware,
    checkUserTwoFactorAuthMiddleware,
    csrfProtectionMiddleware,
    postVerifyEmailController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/send-email-verification",
    rateLimiterMiddleware,
    checkUserTwoFactorAuthMiddleware,
    csrfProtectionMiddleware,
    postSendEmailVerificationController,
  );
  userRouter.post(
    "/send-magic-link",
    rateLimiterMiddleware,
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
    rateLimiterMiddleware,
    csrfProtectionMiddleware,
    getSignInWithMagicLinkController,
  );
  userRouter.post(
    "/sign-in-with-magic-link",
    rateLimiterMiddleware,
    csrfProtectionMiddleware,
    postSignInWithMagicLinkController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );
  userRouter.get(
    "/sign-in-with-passkey",
    rateLimiterMiddleware,
    checkCredentialPromptRequirementsMiddleware,
    csrfProtectionMiddleware,
    getSignInWithPasskeyController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/sign-in-with-passkey",
    rateLimiterMiddleware,
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
    rateLimiterMiddleware,
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
    rateLimiterMiddleware,
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
    rateLimiterMiddleware,
    checkUserIsVerifiedMiddleware,
    csrfProtectionMiddleware,
    postPersonalInformationsController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
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
    rateLimiterMiddleware,
    checkUserHasPersonalInformationsMiddleware,
    csrfProtectionMiddleware,
    postJoinOrganizationMiddleware,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/join-organization-confirm",
    rateLimiterMiddleware,
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
    rateLimiterMiddleware,
    checkUserHasPersonalInformationsMiddleware,
    csrfProtectionMiddleware,
    postCancelModerationAndRedirectControllerFactory("/users/start-sign-in"),
  );

  userRouter.post(
    "/cancel-moderation-and-redirect-to-join-org/:moderation_id",
    rateLimiterMiddleware,
    checkUserHasPersonalInformationsMiddleware,
    csrfProtectionMiddleware,
    postCancelModerationAndRedirectControllerFactory(
      "/users/join-organization",
    ),
  );

  userRouter.post(
    "/cancel-moderation-and-redirect-to-personal-information/:moderation_id",
    rateLimiterMiddleware,
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
    rateLimiterMiddleware,
    checkUserHasAtLeastOneOrganizationMiddleware,
    csrfProtectionMiddleware,
    postSelectOrganizationMiddleware,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/official-contact-email-verification/:organization_id",
    rateLimiterMiddleware,
    checkUserHasSelectedAnOrganizationMiddleware,
    csrfProtectionMiddleware,
    getOfficialContactEmailVerificationController,
  );

  userRouter.post(
    "/official-contact-email-verification/:organization_id",
    rateLimiterMiddleware,
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
    rateLimiterMiddleware,
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
    rateLimiterMiddleware,
    checkUserHasPersonalInformationsMiddleware,
    csrfProtectionMiddleware,
    postCancelModerationAndRedirectControllerFactory(
      "/manage-organizations?notification=cancel_moderation_success",
    ),
  );

  userRouter.post(
    "/delete",
    rateLimiterMiddleware,
    checkUserCanAccessAdminMiddleware,
    csrfProtectionMiddleware,
    postDeleteUserController,
  );

  userRouter.post(
    "/franceconnect",
    rateLimiterMiddleware,
    checkUserCanAccessAdminMiddleware,
    csrfProtectionMiddleware,
    postFranceConnectController,
  );
  userRouter.get(
    "/franceconnect/callback",
    rateLimiterMiddleware,
    checkUserCanAccessAdminMiddleware,
    csrfProtectionMiddleware,
    getFranceConnectOidcCallbackController,
  );
  userRouter.get(
    "/franceconnect/logout",
    rateLimiterMiddleware,
    checkUserCanAccessAdminMiddleware,
    getFranceConnectLogoutController,
  );

  return userRouter;
};

export default userRouter;
