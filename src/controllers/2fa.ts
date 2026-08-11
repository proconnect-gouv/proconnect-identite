import type { NextFunction, Request, Response } from "express";
import HttpErrors from "http-errors";
import { z } from "zod";
import { UserIsNot2faCapableError } from "../config/errors";
import { disableForce2fa, enableForce2fa } from "../managers/2fa";
import {
  getUserFromAuthenticatedSession,
  updateUserInAuthenticatedSession,
} from "../managers/session/authenticated";
import { isTotpConfiguredForUser } from "../managers/totp";
import { sendDisable2faMail } from "../managers/user";
import { csrfToken } from "../middlewares/csrf-protection";
import getNotificationsFromRequest from "../services/get-notifications-from-request";

export const getDoubleAuthenticationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: user_id } = getUserFromAuthenticatedSession(req);

    return res.render("double-authentication-choice", {
      pageTitle: "Double authentification",
      notifications: await getNotificationsFromRequest(req),
      isAuthenticatorConfigured: await isTotpConfiguredForUser(user_id),
      csrfToken: csrfToken(req),
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
      return res.redirect("/mfa-decision-helper");
    }

    return res.render("is-totp-app-installed", {
      pageTitle: "Configurer un code à usage unique",
      notifications: await getNotificationsFromRequest(req),
    });
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
        return res.redirect("/mfa-decision-helper/passkey");
      case "other":
        return res.redirect("/mfa-decision-helper/can-install-software");
    }

    return res.render("mfa-decision-helper/index", {
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
    return res.render("mfa-decision-helper/passkey", {
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
          "/mfa-decision-helper/can-install-software/software",
        );
      case "no":
        return res.redirect(
          "/mfa-decision-helper/can-install-software/smartphone",
        );
    }

    return res.render("mfa-decision-helper/can-install-software/index", {
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
    return res.render("mfa-decision-helper/can-install-software/software", {
      pageTitle: "Codes à usage unique (TOTP)",
      csrfToken: csrfToken(req),
    });
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
            "/mfa-decision-helper/can-install-software/smartphone/app",
          );
        case "no":
          return res.redirect(
            "/mfa-decision-helper/can-install-software/external-help-needed",
          );
      }

      return res.render("mfa-decision-helper/can-install-software/smartphone", {
        pageTitle: "Choisir la meilleure méthode pour vous",
        csrfToken: csrfToken(req),
      });
    } catch (error) {
      next(error);
    }
  };

export const getMfaDecisionHelperCanInstallSoftwareSmartphoneAppController =
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.render(
        "mfa-decision-helper/can-install-software/smartphone-app",
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
        "mfa-decision-helper/can-install-software/external-help-needed",
        {
          pageTitle: "Intervention extérieure nécessaire",
          csrfToken: csrfToken(req),
        },
      );
    } catch (error) {
      next(error);
    }
  };

export const postSetForce2faController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({ force2fa: z.enum(["enable", "disable"]) });
    const { force2fa } = await schema.parseAsync(req.body);

    let updatedUser;

    const { id: user_id } = getUserFromAuthenticatedSession(req);

    if (force2fa === "enable") {
      updatedUser = await enableForce2fa(user_id);
      updateUserInAuthenticatedSession(req, updatedUser);
      return res.redirect(
        `/connection-and-account?notification=2fa_successfully_enabled`,
      );
    } else {
      updatedUser = await disableForce2fa(user_id);
      updateUserInAuthenticatedSession(req, updatedUser);
      await sendDisable2faMail({ user_id });
      return res.redirect(
        `/connection-and-account?notification=2fa_successfully_disabled`,
      );
    }
  } catch (error) {
    if (error instanceof UserIsNot2faCapableError) {
      return next(new HttpErrors.UnprocessableEntity());
    }

    next(error);
  }
};
