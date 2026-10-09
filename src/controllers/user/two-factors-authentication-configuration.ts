import { NotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
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
  confirmTotpRegistration,
  generateTotpRegistrationOptions,
} from "../../managers/totp";
import { sendAddFreeTOTPEmail } from "../../managers/user";
import { csrfToken } from "../../middlewares/csrf-protection";
import { codeSchema } from "../../services/custom-zod-schemas";
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
      notifications: await getNotificationsFromRequest(req),
      spName: req.session.spName,
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
    if (req.query["radio-2fa"] === "dont-know") {
      return res.redirect("/users/mfa-decision-helper");
    }

    return res.render("user/is-totp-app-installed", {
      pageTitle: "Installer votre outil d'authentification",
      csrfToken: csrfToken(req),
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

    const { "totp-tool-type": totpToolType } = req.query;

    return res.render("user/totp-configuration", {
      pageTitle: "Configurer un code à usage unique",
      notifications: await getNotificationsFromRequest(req),
      hasCodeError,
      csrfToken: csrfToken(req),
      humanReadableTotpKey,
      qrCodeDataUrl,
      totpToolType,
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

    const updatedUser = await confirmTotpRegistration(
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
      const { "totp-tool-type": totpToolType } = req.body;
      const totpToolTypeParam = totpToolType
        ? `&totp-tool-type=${encodeURIComponent(totpToolType)}`
        : "";
      return res.redirect(
        `/users/totp-configuration?notification=invalid_totp_token${totpToolTypeParam}`,
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
      spName: req.session.spName,
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

export const getMfaDecisionHelperController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { "device-type": deviceType } = req.query;

    switch (deviceType) {
      case "mac":
      case "windows-hello":
        return res.redirect("/users/mfa-decision-helper/passkey");
      case "other":
        return res.redirect("/users/mfa-decision-helper/can-install-software");
    }

    return res.render("user/mfa-decision-helper/index", {
      pageTitle: "Trouver la meilleure méthode de 2FA",
      csrfToken: csrfToken(req),
    });
  } catch (error) {
    next(error);
  }
};

export const getMfaDecisionHelperPasskeyController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    return res.render("user/mfa-decision-helper/passkey", {
      pageTitle: "Passkey de votre ordinateur",
      csrfToken: csrfToken(req),
      notifications: await getNotificationsFromRequest(req),
    });
  } catch (error) {
    next(error);
  }
};

export const getMfaDecisionHelperCanInstallSoftwareController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { "can-install-software": canInstallSoftware } = req.query;

    switch (canInstallSoftware) {
      case "yes":
        return res.redirect(
          "/users/mfa-decision-helper/can-install-software/software",
        );
      case "no":
        return res.redirect(
          "/users/mfa-decision-helper/can-install-software/smartphone",
        );
    }

    return res.render("user/mfa-decision-helper/can-install-software/index", {
      pageTitle: "Choisir la meilleure méthode pour vous",
      csrfToken: csrfToken(req),
      notifications: await getNotificationsFromRequest(req),
    });
  } catch (error) {
    next(error);
  }
};

export const getMfaDecisionHelperCanInstallSoftwareSoftwareController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    return res.render(
      "user/mfa-decision-helper/can-install-software/software",
      {
        pageTitle: "Codes à usage unique (TOTP)",
        csrfToken: csrfToken(req),
      },
    );
  } catch (error) {
    next(error);
  }
};

export const getMfaDecisionHelperCanInstallSoftwareExternalHelpNeededController =
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.render(
        "user/mfa-decision-helper/can-install-software/external-help-needed",
        {
          pageTitle: "Intervention extérieure nécessaire",
          csrfToken: csrfToken(req),
        },
      );
    } catch (error) {
      next(error);
    }
  };

export const getMfaDecisionHelperCanInstallSoftwareSmartphoneController =
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { "can-install-app-on-smartphone": canInstallAppOnSmartphone } =
        req.query;

      switch (canInstallAppOnSmartphone) {
        case "yes":
          return res.redirect(
            "/users/mfa-decision-helper/can-install-software/smartphone/app",
          );
        case "no":
          return res.redirect(
            "/users/mfa-decision-helper/can-install-software/external-help-needed",
          );
      }

      return res.render(
        "user/mfa-decision-helper/can-install-software/smartphone",
        {
          pageTitle: "Choisir la meilleure méthode pour vous",
          csrfToken: csrfToken(req),
        },
      );
    } catch (error) {
      next(error);
    }
  };

export const getMfaDecisionHelperCanInstallSoftwareSmartphoneAppController =
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.render(
        "user/mfa-decision-helper/can-install-software/smartphone-app",
        {
          pageTitle: "Codes à usage unique (TOTP)",
          csrfToken: csrfToken(req),
        },
      );
    } catch (error) {
      next(error);
    }
  };
