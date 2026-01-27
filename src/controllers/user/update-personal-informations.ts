import type { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";
import {
  getUserFromAuthenticatedSession,
  updateUserInAuthenticatedSession,
} from "../../managers/session/authenticated";
import {
  getUserVerificationLabel,
  updatePersonalInformationsForRegistration,
} from "../../managers/user";
import { csrfToken } from "../../middlewares/csrf-protection";
import {
  nameSchema,
  phoneNumberSchema,
} from "../../services/custom-zod-schemas";
import getNotificationsFromRequest from "../../services/get-notifications-from-request";

export const getPersonalInformationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      family_name,
      given_name,
      id: userId,
      job,
      needs_inclusionconnect_onboarding_help,
      phone_number,
    } = getUserFromAuthenticatedSession(req);
    const verifiedBy = await getUserVerificationLabel(userId);
    return res.render("user/personal-information", {
      csrfToken: csrfToken(req),
      family_name,
      given_name,
      job,
      needs_inclusionconnect_onboarding_help,
      notifications: await getNotificationsFromRequest(req),
      pageTitle: "Renseigner votre identité",
      phone_number,
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
    });

    const { given_name, family_name, phone_number } = await schema.parseAsync(
      req.body,
    );

    const updatedUser = await updatePersonalInformationsForRegistration(
      getUserFromAuthenticatedSession(req).id,
      {
        given_name,
        family_name,
        phone_number,
      },
    );

    updateUserInAuthenticatedSession(req, updatedUser);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.redirect(
        `/users/personal-information?notification=invalid_personal_informations`,
      );
    }

    next(error);
  }
};
