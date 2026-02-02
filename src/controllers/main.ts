import type { NextFunction, Request, Response } from "express";
import moment from "moment/moment";
import z, { ZodError } from "zod";
import notificationMessages from "../config/notification-messages";
import { is2FACapable } from "../managers/2fa";
import { getUserOrganizations } from "../managers/organization/main";
import {
  getUserFromAuthenticatedSession,
  updateUserInAuthenticatedSession,
} from "../managers/session/authenticated";
import { isTotpConfiguredForUser } from "../managers/totp";
import {
  getUserVerificationLabel,
  hasValidFranceConnectIdentity,
  sendUpdatePersonalInformationEmail,
  updatePersonalInformationsForDashboard,
} from "../managers/user";
import { getUserAuthenticators } from "../managers/webauthn";
import { csrfToken } from "../middlewares/csrf-protection";
import {
  jobSchema,
  nameSchema,
  phoneNumberSchema,
} from "../services/custom-zod-schemas";
import { getNotificationsFromRequest } from "../services/get-notifications-from-request";

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
      csrfToken: csrfToken(req),
      email: user.email,
      family_name: user.family_name,
      given_name: user.given_name,
      job: user.job,
      notifications: await getNotificationsFromRequest(req),
      pageTitle: "Informations personnelles",
      phone_number: user.phone_number,
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
    const schema = z.object({
      given_name: nameSchema(),
      family_name: nameSchema(),
      phone_number: phoneNumberSchema(),
      job: jobSchema(),
    });

    const { given_name, family_name, phone_number, job } =
      await schema.parseAsync(req.body);

    const { id: userId } = getUserFromAuthenticatedSession(req);
    const verifiedBy = await getUserVerificationLabel(userId);

    const updatedUser = await updatePersonalInformationsForDashboard(userId, {
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
      csrfToken: csrfToken(req),
      email: updatedUser.email,
      family_name: updatedUser.family_name,
      given_name: updatedUser.given_name,
      job: updatedUser.job,
      notifications: [
        notificationMessages["personal_information_update_success"],
      ],
      pageTitle: "Informations personnelles",
      phone_number: updatedUser.phone_number,
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
      await getUserOrganizations(getUserFromAuthenticatedSession(req).id);

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
      await hasValidFranceConnectIdentity(user_id);

    return res.render("connection-and-account", {
      pageTitle: "Compte et connexion",
      notifications: await getNotificationsFromRequest(req),
      email: email,
      isAuthenticatorConfigured: await isTotpConfiguredForUser(user_id),
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

export const getConditionsGeneralesDUtilisationController = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    return res.render("legal-proconnect/cgu", {
      pageTitle: "Conditions Générales d'Utilisation - ProConnect",
    });
  } catch (error) {
    next(error);
  }
};

export const getPolitiqueDeConfidentialiteController = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    return res.render("legal-proconnect/privacy-policy", {
      pageTitle: "Politique de confidentialité - ProConnect",
    });
  } catch (error) {
    next(error);
  }
};

export const getAccessibiliteController = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    return res.render("legal-proconnect/accessibility", {
      pageTitle: "Accessibilité - ProConnect",
    });
  } catch (error) {
    next(error);
  }
};
