import type { NextFunction, Request, Response } from "express";
import {
  getUserFromAuthenticatedSession,
  isPasskeyAuthenticatedSession,
} from "../../managers/session/authenticated";
import { isAuthenticatorAppConfiguredForUser } from "../../managers/totp";
import { isWebauthnConfiguredForUser } from "../../managers/webauthn";
import { csrfToken } from "../../middlewares/csrf-protection";
import getNotificationsFromRequest, {
  getNotificationLabelFromRequest,
} from "../../services/get-notifications-from-request";

export const get2faSignInController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, email } = getUserFromAuthenticatedSession(req);

    const showsTotpSection = await isAuthenticatorAppConfiguredForUser(id);
    let hasCodeError = false;
    if (showsTotpSection) {
      const notificationLabel = await getNotificationLabelFromRequest(req);
      hasCodeError = notificationLabel === "invalid_totp_token";
    }
    const notifications = hasCodeError
      ? []
      : await getNotificationsFromRequest(req);

    // If a passkey has already been used for authentication in this session,
    // we cannot use another passkey, or even the same one, for a second factor.
    // To ensure proper security, we need to combine proof of possession with a different type of proof,
    // such as inherent or knowledge.
    const showsPasskeySection =
      !isPasskeyAuthenticatedSession(req) &&
      (await isWebauthnConfiguredForUser(id));

    return res.render("user/2fa-sign-in", {
      pageTitle: "Se connecter avec la double authentification",
      notifications,
      hasCodeError,
      csrfToken: csrfToken(req),
      email,
      showsTotpSection,
      showsPasskeySection,
      illustration: "illu-password.svg",
    });
  } catch (error) {
    next(error);
  }
};
