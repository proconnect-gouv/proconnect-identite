import type { NextFunction, Request, Response } from "express";
import moment from "moment/moment";
import { ZodError } from "zod";
import { DIRTY_DS_REDIRECTION_URL } from "../config/env";
import notificationMessages from "../config/notification-messages";
import { is2FACapable } from "../managers/2fa";
import { getUserOrganizations } from "../managers/organization/main";
import {
  getUserFromAuthenticatedSession,
  updateUserInAuthenticatedSession,
} from "../managers/session/authenticated";
import {
  deleteNeedsDirtyDSRedirect,
  getNeedsDirtyDSRedirect,
  setNeedsDirtyDSRedirect,
} from "../managers/session/dirty-ds-redirect";
import { isAuthenticatorAppConfiguredForUser } from "../managers/totp";
import {
  getUserVerificationLabel,
  isUserVerifiedWithFranceconnect,
  sendUpdatePersonalInformationEmail,
  updatePersonalInformations,
} from "../managers/user";
import { getUserAuthenticators } from "../managers/webauthn";
import { csrfToken } from "../middlewares/csrf-protection";
import {
  getNotificationLabelFromRequest,
  getNotificationsFromRequest,
} from "../services/get-notifications-from-request";
import { getParamsForPostPersonalInformationsController } from "./user/update-personal-informations";

export const getHomeController = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  return res.render("home", {
    pageTitle: "Accueil",
    notifications: await getNotificationsFromRequest(req),
  });
};

export const getPersonalInformationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = getUserFromAuthenticatedSession(req);
    const verifiedBy = await getUserVerificationLabel(user.id);

    return res.render("personal-information", {
      pageTitle: "Informations personnelles",
      email: user.email,
      given_name: user.given_name,
      family_name: user.family_name,
      phone_number: user.phone_number,
      job: user.job,
      notifications: await getNotificationsFromRequest(req),
      csrfToken: csrfToken(req),
      verifiedBy,
    });
  } catch (error) {
    next(error);
  }
};

export const postPersonalInformationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { given_name, family_name, phone_number, job } =
      await getParamsForPostPersonalInformationsController(req);
    const { id: userId } = getUserFromAuthenticatedSession(req);
    const verifiedBy = await getUserVerificationLabel(userId);

    const updatedUser = await updatePersonalInformations(userId, {
      given_name,
      family_name,
      phone_number,
      job,
    });

    await sendUpdatePersonalInformationEmail({
      previousInformations: getUserFromAuthenticatedSession(req),
      newInformation: updatedUser,
    });

    updateUserInAuthenticatedSession(req, updatedUser);

    return res.render("personal-information", {
      pageTitle: "Informations personnelles",
      email: updatedUser.email,
      given_name: updatedUser.given_name,
      family_name: updatedUser.family_name,
      phone_number: updatedUser.phone_number,
      job: updatedUser.job,
      notifications: [
        notificationMessages["personal_information_update_success"],
      ],
      csrfToken: csrfToken(req),
      verifiedBy,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.redirect(
        `/personal-information?notification=invalid_personal_informations`,
      );
    }

    next(error);
  }
};

export const getManageOrganizationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userOrganizations, pendingUserOrganizations } =
      await getUserOrganizations({
        user_id: getUserFromAuthenticatedSession(req).id,
      });

    return res.render("manage-organizations", {
      pageTitle: "Organisations",
      notifications: await getNotificationsFromRequest(req),
      userOrganizations,
      pendingUserOrganizations,
      csrfToken: csrfToken(req),
    });
  } catch (error) {
    next(error);
  }
};

export const getConnectionAndAccountController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      id: user_id,
      email,
      totp_key_verified_at,
      force_2fa: force2fa,
    } = getUserFromAuthenticatedSession(req);

    const passkeys = await getUserAuthenticators(email);
    const is2faCapable = await is2FACapable(user_id);
    const isVerifiedWithFranceConnect =
      await isUserVerifiedWithFranceconnect(user_id);

    // Dirty ad hoc implementation waiting for complete acr support on ProConnect
    const notificationLabel = await getNotificationLabelFromRequest(req);
    if (notificationLabel === "2fa_not_configured_for_ds") {
      setNeedsDirtyDSRedirect(req);
    }
    if (
      notificationLabel &&
      ["authenticator_added", "passkey_successfully_created"].includes(
        notificationLabel,
      ) &&
      getNeedsDirtyDSRedirect(req)
    ) {
      deleteNeedsDirtyDSRedirect(req);

      return res.redirect(DIRTY_DS_REDIRECTION_URL);
    }
    return res.render("connection-and-account", {
      pageTitle: "Compte et connexion",
      notifications: await getNotificationsFromRequest(req),
      email: email,
      isAuthenticatorConfigured:
        await isAuthenticatorAppConfiguredForUser(user_id),
      isVerifiedWithFranceConnect,
      passkeys,
      totpKeyVerifiedAt: totp_key_verified_at
        ? moment(totp_key_verified_at)
            .tz("Europe/Paris")
            .locale("fr")
            .calendar()
        : null,
      csrfToken: csrfToken(req),
      is2faCapable,
      force2fa,
    });
  } catch (error) {
    next(error);
  }
};
