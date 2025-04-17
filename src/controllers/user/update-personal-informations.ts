import {
  createOidcChecks,
  getFranceConnectRedirectUrlFactory,
} from "@gouvfr-lasuite/proconnect.identite/managers/franceconnect";
import type { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";
import {
  FEATURE_FRANCECONNECT_CONNECTION,
  FRANCECONNECT_SCOPES,
  HOST,
} from "../../config/env";
import { getFranceConnectConfiguration } from "../../connectors/franceconnect";
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

export async function postPersonalInformationsOauthFranceConnectController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const getFranceConnectRedirectUrl =
      await getFranceConnectRedirectUrlFactory(getFranceConnectConfiguration, {
        callbackUrl: `${HOST}/users/personal-information/oauth/franceconnect/callback`,
        scope: FRANCECONNECT_SCOPES.join(" "),
      });

    const { nonce, state } = createOidcChecks();
    req.session.nonce = nonce;
    req.session.state = state;

    const url = await getFranceConnectRedirectUrl(nonce, state);

    return res.redirect(url.toString());
  } catch (error) {
    next(error);
  }
}
