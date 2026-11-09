import { UserNotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { runtime } from "../../connectors/context";
import { getUserFromAuthenticatedSession } from "../../managers/session/authenticated";
import { lastFranceConnectIdentityUpdate } from "../../managers/user";
import { csrfToken } from "../../middlewares/csrf-protection";
import { nameSchema } from "../../services/custom-zod-schemas";
import getNotificationsFromRequest from "../../services/get-notifications-from-request";
import { track } from "../../services/log";

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
    } = await getUserFromAuthenticatedSession(req);

    return res.render("user/personal-information", {
      csrfToken: csrfToken(req),
      family_name,
      given_name,
      job,
      needs_inclusionconnect_onboarding_help,
      notifications: await getNotificationsFromRequest(req),
      pageTitle: "Renseigner votre identité",
      phone_number,
      hasFranceConnectIdentity: await lastFranceConnectIdentityUpdate(userId),
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
  const { id: userId } = await getUserFromAuthenticatedSession(req);

  if (await lastFranceConnectIdentityUpdate(userId)) {
    return next();
  }

  const parsed = z
    .object({
      given_name: nameSchema(),
      family_name: nameSchema(),
    })
    .safeParse(req.body);

  if (!parsed.success) {
    track("personal_information.invalid", {
      error: z.prettifyError(parsed.error),
    });
    return res.redirect(
      `/users/personal-information?notification=invalid_personal_informations`,
    );
  }

  const outcome = await runtime
    .as({ type: "user", user_id: userId })
    .updatePersonalInformations({
      information: parsed.data,
      user_id: userId,
    });

  if (outcome.kind === "user_not_found") {
    throw new UserNotFoundError("User not found");
  }

  if (outcome.kind === "info_unchanged") {
    return next();
  }

  next();
};
