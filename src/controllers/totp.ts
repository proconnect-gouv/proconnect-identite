import { NotFoundError } from "@gouvfr-lasuite/proconnect.identite/errors";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { InvalidTotpTokenError } from "../config/errors";
import {
  addAuthenticationMethodReferenceInSession,
  getUserFromAuthenticatedSession,
  updateUserInAuthenticatedSession,
} from "../managers/session/authenticated";
import {
  deleteTemporaryForce2Fa,
  getTemporaryForce2Fa,
} from "../managers/session/temporary-force-2fa";
import {
  deleteTemporaryTotpKey,
  getTemporaryTotpKey,
  setTemporaryTotpKey,
} from "../managers/session/temporary-totp-key";
import {
  authenticateWithTotp,
  confirmTotpRegistration,
  deleteTotpConfiguration,
  generateTotpRegistrationOptions,
  isTotpConfiguredForUser,
} from "../managers/totp";
import {
  sendAddFreeTOTPEmail,
  sendDeleteFreeTOTPApplicationEmail,
} from "../managers/user";
import { csrfToken } from "../middlewares/csrf-protection";
import { codeSchema } from "../services/custom-zod-schemas";
import getNotificationsFromRequest, {
  getNotificationLabelFromRequest,
} from "../services/get-notifications-from-request";

export const getTotpConfigurationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: user_id, email } = getUserFromAuthenticatedSession(req);

    const existingTemporaryTotpKey = getTemporaryTotpKey(req);

    const { totpKey, humanReadableTotpKey, qrCodeDataUrl } =
      await generateTotpRegistrationOptions(email, existingTemporaryTotpKey);

    setTemporaryTotpKey(req, totpKey);

    const notificationLabel = await getNotificationLabelFromRequest(req);
    const hasCodeError = notificationLabel === "invalid_totp_token";

    return res.render("totp-configuration", {
      pageTitle: "Configuration TOTP",
      notifications: await getNotificationsFromRequest(req),
      hasCodeError,
      csrfToken: csrfToken(req),
      isAuthenticatorAlreadyConfigured: await isTotpConfiguredForUser(user_id),
      humanReadableTotpKey,
      qrCodeDataUrl,
    });
  } catch (error) {
    next(error);
  }
};

export const postTotpConfigurationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      totpToken: codeSchema(),
    });
    const { totpToken } = await schema.parseAsync(req.body);

    const { id: user_id } = getUserFromAuthenticatedSession(req);
    const temporaryTotpKey = getTemporaryTotpKey(req);

    if (!temporaryTotpKey) {
      throw new NotFoundError();
    }

    const temporaryForce2fa = getTemporaryForce2Fa(req);

    const updatedUser = await confirmTotpRegistration(
      user_id,
      temporaryTotpKey,
      totpToken,
      temporaryForce2fa,
    );

    deleteTemporaryTotpKey(req);
    deleteTemporaryForce2Fa(req);
    addAuthenticationMethodReferenceInSession(req, res, updatedUser, "totp");

    await sendAddFreeTOTPEmail({ user_id });

    return res.redirect(
      "/connection-and-account?notification=authenticator_added",
    );
  } catch (error) {
    if (error instanceof InvalidTotpTokenError) {
      return res.redirect(
        "/totp-configuration?notification=invalid_totp_token",
      );
    }

    next(error);
  }
};

export const postDeleteTotpConfigurationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: user_id } = getUserFromAuthenticatedSession(req);

    const updatedUser = await deleteTotpConfiguration(user_id);

    updateUserInAuthenticatedSession(req, updatedUser);

    await sendDeleteFreeTOTPApplicationEmail({ user_id });

    return res.redirect(
      `/connection-and-account?notification=authenticator_successfully_deleted`,
    );
  } catch (error) {
    next(error);
  }
};

export const postSignInWithTotpController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      totpToken: codeSchema(),
    });

    const { totpToken } = await schema.parseAsync(req.body);

    const { id: user_id } = getUserFromAuthenticatedSession(req);

    const user = await authenticateWithTotp(user_id, totpToken);

    addAuthenticationMethodReferenceInSession(req, res, user, "totp");

    return next();
  } catch (error) {
    if (error instanceof InvalidTotpTokenError) {
      return res.redirect("/users/2fa-sign-in?notification=invalid_totp_token");
    }
    next(error);
  }
};
