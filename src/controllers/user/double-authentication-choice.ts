import type { NextFunction, Request, Response } from "express";
import { getUserFromAuthenticatedSession } from "../../managers/session/authenticated";
import {
  getTemporaryTotpKey,
  setTemporaryTotpKey,
} from "../../managers/session/temporary-totp-key";
import { generateAuthenticatorAppRegistrationOptions } from "../../managers/totp";
import { csrfToken } from "../../middlewares/csrf-protection";
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
    return res.render("user/authenticator-app-configuration", {
      pageTitle: "Configurer un code à usage unique",
      csrfToken: csrfToken(req),
      illustration: "illu-2FA.svg",
      humanReadableTotpKey,
      qrCodeDataUrl,
    });
  } catch (error) {
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
  return next();
};
