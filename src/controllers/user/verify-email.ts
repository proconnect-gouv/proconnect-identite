import type { NextFunction, Request, Response } from "express";
import moment from "moment";
import { z, ZodError } from "zod";
import { MIN_DURATION_BETWEEN_TWO_VERIFICATION_CODE_SENDING_IN_SECONDS } from "../../config/env";
import {
  InvalidTokenError,
  NoNeedVerifyEmailAddressError,
} from "../../config/errors";
import { isBrowserTrustedForUser } from "../../managers/browser-authentication";
import {
  addAuthenticationMethodReferenceInSession,
  getUserFromAuthenticatedSession,
  updateUserInAuthenticatedSession,
} from "../../managers/session/authenticated";
import {
  sendEmailAddressVerificationEmail,
  verifyEmail,
} from "../../managers/user";
import { csrfToken } from "../../middlewares/csrf-protection";
import {
  codeSchema,
  optionalBooleanSchema,
} from "../../services/custom-zod-schemas";
import getNotificationsFromRequest from "../../services/get-notifications-from-request";

export const getVerifyEmailController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      new_code_sent: optionalBooleanSchema(),
    });

    const { new_code_sent } = await schema.parseAsync(req.query);

    const { email, needs_inclusionconnect_onboarding_help } =
      getUserFromAuthenticatedSession(req);

    const { codeSent, updatedUser } = await sendEmailAddressVerificationEmail({
      email,
      isBrowserTrusted: isBrowserTrustedForUser(req),
    });

    updateUserInAuthenticatedSession(req, updatedUser);

    return res.render("user/verify-email", {
      pageTitle: "Vérifier votre email",
      notifications: await getNotificationsFromRequest(req),
      email,
      countdownEndDate: moment(updatedUser.verify_email_sent_at)
        .add(MIN_DURATION_BETWEEN_TWO_VERIFICATION_CODE_SENDING_IN_SECONDS, "s")
        .tz("Europe/Paris")
        .locale("fr")
        .format(),
      csrfToken: csrfToken(req),
      newCodeSent: new_code_sent,
      codeSent,
      needs_inclusionconnect_onboarding_help,
      minDurationToWaitInMinutes: moment()
        .add(
          MIN_DURATION_BETWEEN_TWO_VERIFICATION_CODE_SENDING_IN_SECONDS,
          "seconds",
        )
        .tz("Europe/Paris")
        .locale("fr")
        .toNow(true),
      illustration: "illu-password.svg",
    });
  } catch (error) {
    if (error instanceof NoNeedVerifyEmailAddressError) {
      return res.redirect(
        `/users/personal-information?notification=no_need_to_verify_email_address`,
      );
    }

    next(error);
  }
};

export const postVerifyEmailController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      verify_email_token: codeSchema(),
    });

    const { verify_email_token } = await schema.parseAsync(req.body);

    const { email } = getUserFromAuthenticatedSession(req);

    const updatedUser = await verifyEmail(email, verify_email_token);

    addAuthenticationMethodReferenceInSession(
      req,
      res,
      updatedUser,
      "email-otp",
    );

    next();
  } catch (error) {
    if (error instanceof InvalidTokenError || error instanceof ZodError) {
      return res.redirect(
        `/users/verify-email?notification=invalid_verify_email_code`,
      );
    }

    next(error);
  }
};

export const postSendEmailVerificationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = getUserFromAuthenticatedSession(req);

    const { updatedUser } = await sendEmailAddressVerificationEmail({
      email,
      isBrowserTrusted: isBrowserTrustedForUser(req),
      force: true,
    });

    updateUserInAuthenticatedSession(req, updatedUser);

    return res.redirect(`/users/verify-email?new_code_sent=true`);
  } catch (error) {
    if (error instanceof NoNeedVerifyEmailAddressError) {
      return res.redirect(
        `/users/personal-information?notification=no_need_to_verify_email_address`,
      );
    }

    next(error);
  }
};
