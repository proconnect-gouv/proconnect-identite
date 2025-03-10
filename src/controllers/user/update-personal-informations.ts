import type { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";
import {
  getUserFromAuthenticatedSession,
  updateUserInAuthenticatedSession,
} from "../../managers/session/authenticated";
import {
  getUserVerificationLabel,
  updatePersonalInformations,
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
      pageTitle: "Renseigner votre identité",
      given_name,
      family_name,
      phone_number,
      job,
      needs_inclusionconnect_onboarding_help,
      notifications: await getNotificationsFromRequest(req),
      csrfToken: csrfToken(req),
      verifiedBy,
    });
  } catch (error) {
    next(error);
  }
};

export const getParamsForPostPersonalInformationsController = async (
  req: Request,
) => {
  const schema = z.object({
    given_name: nameSchema(),
    family_name: nameSchema(),
    phone_number: phoneNumberSchema(),
    job: jobSchema(),
  });

  return await schema.parseAsync(req.body);
};
export const postPersonalInformationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { given_name, family_name, phone_number, job } =
      await getParamsForPostPersonalInformationsController(req);

    const updatedUser = await updatePersonalInformations(
      getUserFromAuthenticatedSession(req).id,
      {
        given_name,
        family_name,
        phone_number,
        job,
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
