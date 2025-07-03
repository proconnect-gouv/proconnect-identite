import { NotFoundError } from "@gouvfr-lasuite/proconnect.identite/errors";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { InvalidTotpTokenError } from "../../config/errors";
import {
  addAuthenticationMethodReferenceInSession,
  getUserFromAuthenticatedSession,
} from "../../managers/session/authenticated";
import {
  deleteTemporaryForce2Fa,
  getTemporaryForce2Fa,
  setTemporaryForce2Fa,
} from "../../managers/session/temporary-force-2fa";
import {
  deleteTemporaryTotpKey,
  getTemporaryTotpKey,
  setTemporaryTotpKey,
} from "../../managers/session/temporary-totp-key";
import {
  confirmTotpRegistration,
  generateTotpRegistrationOptions,
} from "../../managers/totp";
import { sendAddFreeTOTPEmail } from "../../managers/user";
import { csrfToken } from "../../middlewares/csrf-protection";
import {
  codeSchema,
  optionalBooleanSchema,
} from "../../services/custom-zod-schemas";
import getNotificationsFromRequest, {
  getNotificationLabelFromRequest,
} from "../../services/get-notifications-from-request";

export const getTwoFactorsAuthenticationChoiceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    return res.render("user/double-authentication-choice", {
      pageTitle: "Choisir un mode de double authentification",
      csrfToken: csrfToken(req),
      illustration: "illu-2FA.svg",
      notifications: await getNotificationsFromRequest(req),
    });
  } catch (error) {
    next(error);
  }
};

export const getIsTotpAppInstalledController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({ "2fa_force": optionalBooleanSchema() });

    const { "2fa_force": temporaryForce2fa } = await schema.parseAsync(
      req.query,
    );

    setTemporaryForce2Fa(req, temporaryForce2fa);

    return res.render("user/is-totp-app-installed", {
      pageTitle: "Installer votre outil d'authentification",
      csrfToken: csrfToken(req),
      illustration: "illu-2FA.svg",
    });
  } catch (error) {
    next(error);
  }
};

export const getTotpConfigurationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = getUserFromAuthenticatedSession(req);
    const existingTemporaryTotpKey = getTemporaryTotpKey(req);
    const { totpKey, humanReadableTotpKey, qrCodeDataUrl } =
      await generateTotpRegistrationOptions(email, existingTemporaryTotpKey);
    setTemporaryTotpKey(req, totpKey);

    const notificationLabel = await getNotificationLabelFromRequest(req);
    const hasCodeError = notificationLabel === "invalid_totp_token";

    return res.render("user/totp-configuration", {
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
    deleteTemporaryForce2Fa(req);
    deleteTemporaryTotpKey(req);
    addAuthenticationMethodReferenceInSession(req, res, updatedUser, "totp");

    await sendAddFreeTOTPEmail({ user_id });

    return res.redirect("/users/2fa-successfully-configured");
  } catch (error) {
    if (error instanceof InvalidTotpTokenError) {
      return res.redirect(
        "/users/totp-configuration?notification=invalid_totp_token",
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
