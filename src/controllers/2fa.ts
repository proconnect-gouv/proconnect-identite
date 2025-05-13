import type { NextFunction, Request, Response } from "express";
import HttpErrors from "http-errors";
import { z } from "zod";
import { UserIsNot2faCapableError } from "../config/errors";
import { disableForce2fa, enableForce2fa } from "../managers/2fa";
import {
  getUserFromAuthenticatedSession,
  updateUserInAuthenticatedSession,
} from "../managers/session/authenticated";
import { isAuthenticatorAppConfiguredForUser } from "../managers/totp";
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

    return res.render("double-authentication", {
      pageTitle: "Double authentification",
      notifications: await getNotificationsFromRequest(req),
      isAuthenticatorConfigured:
        await isAuthenticatorAppConfiguredForUser(user_id),
      csrfToken: csrfToken(req),
      breadcrumbs: [
        { label: "Tableau de bord", href: "/" },
        { label: "Compte et connexion", href: "/connection-and-account" },
        { label: "Double authentification" },
      ],
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
    return res.render("configuring-single-use-code", {
      pageTitle: "Configurer un code à usage unique",
      notifications: await getNotificationsFromRequest(req),
      breadcrumbs: [
        { label: "Tableau de bord", href: "/" },
        { label: "Compte et connexion", href: "/connection-and-account" },
        { label: "Double authentification", href: "/double-authentication" },
        { label: "Code à usage unique" },
      ],
    });
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
