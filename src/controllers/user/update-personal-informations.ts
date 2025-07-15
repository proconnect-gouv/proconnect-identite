import type { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";
import { FEATURE_FRANCECONNECT_CONNECTION } from "../../config/env";
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
  jobSchema,
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
      canUseFranceConnect: FEATURE_FRANCECONNECT_CONNECTION,
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

const personalInformationSchema = {
  given_name: nameSchema(),
  family_name: nameSchema(),
  phone_number: phoneNumberSchema(),
};
export const getParamsForRegistrationPersonalInformationsController = async (
  req: Request,
) => {
  return await z.object(personalInformationSchema).parseAsync(req.body);
};

export const getParamsForDashboardPersonalInformationsController = async (
  req: Request,
) => {
  return z
    .object(personalInformationSchema)
    .extend({ job: jobSchema() })
    .parseAsync(req.body);
};

export const postPersonalInformationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { given_name, family_name, phone_number } =
      await getParamsForRegistrationPersonalInformationsController(req);

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
