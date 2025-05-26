import { to } from "await-to-js";
import type { NextFunction, Request, Response } from "express";
import HttpErrors from "http-errors";
import { z, ZodError } from "zod";
import { HOST } from "../../config/env";
import {
  InvalidTokenError,
  LeakedPasswordError,
  WeakPasswordError,
} from "../../config/errors";
import { setBrowserAsTrustedForUser } from "../../managers/browser-authentication";
import {
  getUserFromAuthenticatedSession,
  isWithinAuthenticatedSession,
} from "../../managers/session/authenticated";
import {
  getEmailFromUnauthenticatedSession,
  setEmailInUnauthenticatedSession,
} from "../../managers/session/unauthenticated";
import { changePassword, sendResetPasswordEmail } from "../../managers/user";
import { csrfToken } from "../../middlewares/csrf-protection";
import { resetPasswordRateLimiter } from "../../middlewares/rate-limiter";
import { emailSchema } from "../../services/custom-zod-schemas";
import getNotificationsFromRequest from "../../services/get-notifications-from-request";
import hasErrorFromField from "../../services/has-error-from-field";

export const getResetPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    return res.render("user/reset-password", {
      pageTitle: "Réinitialiser mon mot de passe",
      notifications: await getNotificationsFromRequest(req),
      loginHint: isWithinAuthenticatedSession(req.session)
        ? getUserFromAuthenticatedSession(req).email
        : getEmailFromUnauthenticatedSession(req) || null,
      csrfToken: csrfToken(req),
    });
  } catch (error) {
    next(error);
  }
};

export const postResetPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let email: string;
    if (isWithinAuthenticatedSession(req.session)) {
      const user = getUserFromAuthenticatedSession(req);

      email = user.email;
    } else {
      const schema = z.object({
        login: emailSchema(),
      });

      const parsedBody = await schema.parseAsync(req.body);

      email = parsedBody.login;

      // When the user is redirected to start of the sign-in process, the email value will be updated accordingly.
      // The email rate limiter will rely on the email value set in the session here.
      setEmailInUnauthenticatedSession(req, email);
    }

    const [rateLimiterError] = await to(
      resetPasswordRateLimiter.consume(email),
    );

    if (rateLimiterError) {
      return next(new HttpErrors.TooManyRequests());
    }

    await sendResetPasswordEmail(email, HOST);

    return res.redirect(
      "/users/start-sign-in?notification=reset_password_email_sent",
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return res.redirect("/users/reset-password?notification=invalid_email");
    }

    next(error);
  }
};

export const getChangePasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      reset_password_token: z.string().trim().min(1),
    });

    const { reset_password_token } = await schema.parseAsync(req.query);

    return res.render("user/change-password", {
      pageTitle: "Changer votre mot de passe",
      resetPasswordToken: reset_password_token,
      notifications: await getNotificationsFromRequest(req),
      csrfToken: csrfToken(req),
    });
  } catch (error) {
    next(error);
  }
};

export const postChangePasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      reset_password_token: z.string().trim().min(1),
      password: z.string().trim().min(1),
    });

    const { reset_password_token, password } = await schema.parseAsync(
      req.body,
    );

    const { id: user_id } = await changePassword(
      reset_password_token,
      password,
    );

    setBrowserAsTrustedForUser(req, res, user_id);

    return res.redirect(
      `/users/start-sign-in?notification=password_change_success`,
    );
  } catch (error) {
    if (
      error instanceof InvalidTokenError ||
      (error instanceof ZodError &&
        hasErrorFromField(error, "reset_password_token"))
    ) {
      return res.redirect(`/users/reset-password?notification=invalid_token`);
    }
    if (
      error instanceof WeakPasswordError ||
      (error instanceof ZodError && hasErrorFromField(error, "password"))
    ) {
      const resetPasswordToken = req.body.reset_password_token;

      return res.redirect(
        `/users/change-password?reset_password_token=${resetPasswordToken}&notification=weak_password`,
      );
    }

    if (error instanceof LeakedPasswordError) {
      const resetPasswordToken = req.body.reset_password_token;
      return res.redirect(
        `/users/change-password?reset_password_token=${resetPasswordToken}&notification=leaked_password`,
      );
    }

    next(error);
  }
};
