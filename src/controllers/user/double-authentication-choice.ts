import { NotFoundError } from "@gouvfr-lasuite/proconnect.identite/errors";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { InvalidTotpTokenError } from "../../config/errors";
import {
  addAuthenticationMethodReferenceInSession,
  getUserFromAuthenticatedSession,
} from "../../managers/session/authenticated";
import {
  deleteTemporaryTotpKey,
  getTemporaryTotpKey,
  setTemporaryTotpKey,
} from "../../managers/session/temporary-totp-key";
import {
  confirmAuthenticatorAppRegistration,
  generateAuthenticatorAppRegistrationOptions,
} from "../../managers/totp";
import { sendAddFreeTOTPEmail } from "../../managers/user";
import { csrfToken } from "../../middlewares/csrf-protection";
import { codeSchema } from "../../services/custom-zod-schemas";
import getNotificationsFromRequest, {
  getNotificationLabelFromRequest,
} from "../../services/get-notifications-from-request";

export const getDoubleAuthenticationChoiceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    return res.render("user/double-authentication-choice", {
      pageTitle: "Choisir un mode de double authentification",
      csrfToken: csrfToken(req),
      illustration: "illu-2FA.svg",
    });
  } catch (error) {
    next(error);
  }
};

export const getConfiguringSingleUseCodeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    return res.render("user/configuring-single-use-code", {
      pageTitle: "Installer votre outil d'authentification",
      csrfToken: csrfToken(req),
      illustration: "illu-2FA.svg",
    });
  } catch (error) {
    next(error);
  }
};

export const getAuthenticatorAppConfigurationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = getUserFromAuthenticatedSession(req);
    const existingTemporaryTotpKey = getTemporaryTotpKey(req);
    const { totpKey, humanReadableTotpKey, qrCodeDataUrl } =
      await generateAuthenticatorAppRegistrationOptions(
        email,
        existingTemporaryTotpKey,
      );
    setTemporaryTotpKey(req, totpKey);

    const notificationLabel = await getNotificationLabelFromRequest(req);
    const hasCodeError = notificationLabel === "invalid_totp_token";

    return res.render("user/authenticator-app-configuration", {
      pageTitle: "Configurer un code à usage unique",
      notifications: await getNotificationsFromRequest(req),
      hasCodeError,
      csrfToken: csrfToken(req),
      illustration: "illu-2FA.svg",
      humanReadableTotpKey,
      qrCodeDataUrl,
    });
  } catch (error) {
    next(error);
  }
};

export const postAuthenticatorAppConfigurationController = async (
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
    const updatedUser = await confirmAuthenticatorAppRegistration(
      user_id,
      temporaryTotpKey,
      totpToken,
    );

    deleteTemporaryTotpKey(req);
    addAuthenticationMethodReferenceInSession(req, res, updatedUser, "totp");

    await sendAddFreeTOTPEmail({ user_id });

    return res.redirect("/users/2fa-successfully-configured");
  } catch (error) {
    if (error instanceof InvalidTotpTokenError) {
      return res.redirect(
        "/users/authenticator-app-configuration?notification=invalid_totp_token",
      );
    }

    next(error);
  }
};

export const get2faSuccessfullyConfiguredController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    return res.render("user/2fa-successfully-configured", {
      pageTitle: "Votre double authentification est bien configurée",
      csrfToken: csrfToken(req),
      illustration: "illu-ok.svg",
    });
  } catch (error) {
    next(error);
  }
};

export const post2faSuccessfullyConfiguredMiddleware = async (
  _req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    return next();
  } catch (error) {
    next(error);
  }
};
