import { UserNotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import type { NextFunction, Request, Response } from "express";
import { isEmpty } from "lodash-es";
import moment from "moment";
import { match } from "ts-pattern";
import { z, ZodError } from "zod";
import { MIN_DURATION_BETWEEN_TWO_VERIFICATION_CODE_SENDING_IN_SECONDS } from "../../config/env";
import {
  InvalidTokenError,
  NoNeedVerifyEmailAddressError,
} from "../../config/errors";
import { context, runtime } from "../../connectors/context";
import { isBrowserTrustedForUser } from "../../managers/browser-authentication";
import {
  addAuthenticationMethodReferenceInSession,
  getUserFromAuthenticatedSession,
  updateUserInAuthenticatedSession,
} from "../../managers/session/authenticated";
import { sendEmailAddressVerificationEmail } from "../../managers/user";
import { csrfToken } from "../../middlewares/csrf-protection";
import {
  codeSchema,
  optionalBooleanSchema,
} from "../../services/custom-zod-schemas";
import getNotificationsFromRequest from "../../services/get-notifications-from-request";

const { users } = context.repository;

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
    });
  } catch (error) {
    if (error instanceof NoNeedVerifyEmailAddressError) {
      return next();
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

    const found = await users.findByEmail(email);

    if (isEmpty(found)) {
      throw new UserNotFoundError();
    }

    const outcome = await runtime
      .as({ type: "user", user_id: found.id })
      .user.email_verified.mutate({
        source: "verify_email",
        token: verify_email_token,
        user_id: found.id,
      });

    match(outcome)
      .with({ kind: "invalid_token" }, () => {
        throw new InvalidTokenError();
      })
      .with({ kind: "token_expired" }, () => {
        throw new InvalidTokenError();
      })
      .with({ kind: "email_verified" }, ({ user }) => {
        addAuthenticationMethodReferenceInSession(req, res, user, "email-otp");
      })
      .exhaustive();

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
      return next();
    }

    next(error);
  }
};
