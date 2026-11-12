import type { NextFunction, Request, Response } from "express";
import HttpErrors from "http-errors";
import { UserIsNot2faCapableError } from "../../config/errors";
import { isUserInAdministrationEtat } from "../../managers/organization/main";
import { createRecoveryWordsForUser } from "../../managers/recovery-words";
import { getUserFromAuthenticatedSession } from "../../managers/session/authenticated";
import { csrfToken } from "../../middlewares/csrf-protection";
import getNotificationsFromRequest from "../../services/get-notifications-from-request";

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

export const getRecoveryWordsIncentiveController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    return res.render("user/recovery-words-incentive", {
      pageTitle: "Sauvegardez vos mots de secours",
      csrfToken: csrfToken(req),
    });
  } catch (error) {
    next(error);
  }
};

export const postRecoveryWordsSetupController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: user_id } = getUserFromAuthenticatedSession(req);

    const recoveryWords = await createRecoveryWordsForUser(user_id);

    return res.render("user/recovery-words-setup", {
      pageTitle: "Sauvegarder vos mots de secours",
      csrfToken: csrfToken(req),
      recoveryWords: recoveryWords.split("-"),
      isAdministrationEtat: await isUserInAdministrationEtat(user_id),
    });
  } catch (error) {
    if (error instanceof UserIsNot2faCapableError) {
      return next(new HttpErrors.UnprocessableEntity());
    }
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
