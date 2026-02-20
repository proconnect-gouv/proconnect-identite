import type { User } from "@proconnect-gouv/proconnect.identite/types";
import type { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";
import {
  getUserFromAuthenticatedSession,
  updateUserInAuthenticatedSession,
} from "../../managers/session/authenticated";
import { hasFranceConnectIdentity } from "../../managers/user";
import { csrfToken } from "../../middlewares/csrf-protection";
import { update } from "../../repositories/user";
import { jobSchema, nameSchema } from "../../services/custom-zod-schemas";
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

    return res.render("user/personal-information", {
      csrfToken: csrfToken(req),
      family_name,
      given_name,
      job,
      needs_inclusionconnect_onboarding_help,
      notifications: await getNotificationsFromRequest(req),
      pageTitle: "Renseigner votre identité",
      phone_number,
      hasFranceConnectIdentity: await hasFranceConnectIdentity(userId),
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
    const { id: userId } = getUserFromAuthenticatedSession(req);
    const hasFCIdentity = await hasFranceConnectIdentity(userId);

    let updatedUser: User;

    if (hasFCIdentity) {
      const schema = z.object({
        job: jobSchema(),
      });

      const { job } = await schema.parseAsync(req.body);

      updatedUser = await update(userId, {
        job,
      });
    } else {
      const schema = z.object({
        given_name: nameSchema(),
        family_name: nameSchema(),
        job: jobSchema(),
      });

      const { given_name, family_name, job } = await schema.parseAsync(
        req.body,
      );

      updatedUser = await update(userId, {
        given_name,
        family_name,
        job,
      });
    }

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
