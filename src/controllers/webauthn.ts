import { NotFoundError } from "@gouvfr-lasuite/proconnect.identite/errors";
import type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/types";
import type { NextFunction, Request, Response } from "express";
import HttpErrors from "http-errors";
import { z, ZodError } from "zod";
import {
  UserNotLoggedInError,
  WebauthnAuthenticationFailedError,
  WebauthnRegistrationFailedError,
} from "../config/errors";
import {
  addAuthenticationMethodReferenceInSession,
  createAuthenticatedSession,
  getUserFromAuthenticatedSession,
  updateUserInAuthenticatedSession,
} from "../managers/session/authenticated";
import { getEmailFromUnauthenticatedSession } from "../managers/session/unauthenticated";
import {
  sendActivateAccessKeyMail,
  sendDeleteAccessKeyMail,
} from "../managers/user";
import {
  deleteUserAuthenticator,
  getAuthenticationOptions,
  getRegistrationOptions,
  verifyAuthentication,
  verifyRegistration,
} from "../managers/webauthn";
import { csrfToken } from "../middlewares/csrf-protection";
import { optionalCheckboxSchema } from "../services/custom-zod-schemas";
import getNotificationsFromRequest from "../services/get-notifications-from-request";
import { logger } from "../services/log";

export const deletePasskeyController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      credential_id: z.string(),
    });
    const { credential_id } = schema.parse(req.params);

    const { email, id: user_id } = getUserFromAuthenticatedSession(req);

    await deleteUserAuthenticator(email, credential_id);

    await sendDeleteAccessKeyMail({ user_id });

    return res.redirect(
      `/connection-and-account?notification=passkey_successfully_deleted`,
    );
  } catch (e) {
    next(e);
  }
};

export const getGenerateRegistrationOptionsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = getUserFromAuthenticatedSession(req);

    const { updatedUser, registrationOptions } =
      await getRegistrationOptions(email);
    updateUserInAuthenticatedSession(req, updatedUser);

    return res.json(registrationOptions);
  } catch (e) {
    if (e instanceof UserNotLoggedInError) {
      return next(new HttpErrors.Unauthorized());
    }
    next(e);
  }
};

export const postVerifyRegistrationControllerFactory =
  (redirectUrl: string, errorRedirectUrl: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = z.object({
        webauthn_registration_response_string: z.string(),
        force_2fa: optionalCheckboxSchema(),
      });
      const { webauthn_registration_response_string, force_2fa } =
        await schema.parseAsync(req.body);

      const registrationResponseJson = JSON.parse(
        webauthn_registration_response_string,
      );
      const registrationResponseSchema = z.custom<RegistrationResponseJSON>();

      const response = await registrationResponseSchema.parseAsync(
        registrationResponseJson,
      );

      const { email, id: user_id } = getUserFromAuthenticatedSession(req);

      const { userVerified, user: updatedUser } = await verifyRegistration({
        email: email,
        response,
        force_2fa,
      });
      addAuthenticationMethodReferenceInSession(req, res, updatedUser, "pop");
      if (userVerified) {
        addAuthenticationMethodReferenceInSession(req, res, updatedUser, "uv");
      }
      await sendActivateAccessKeyMail({ user_id });

      return res.redirect(redirectUrl);
    } catch (e) {
      logger.error(e);
      if (
        e instanceof ZodError ||
        e instanceof WebauthnRegistrationFailedError
      ) {
        return res.redirect(errorRedirectUrl);
      }

      next(e);
    }
  };

export const getSignInWithPasskeyController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    return res.render("user/sign-in-with-passkey", {
      pageTitle: "Se connecter avec une clé d’accès",
      notifications: await getNotificationsFromRequest(req),
      csrfToken: csrfToken(req),
    });
  } catch (e) {
    next(e);
  }
};

export const getGenerateAuthenticationOptionsControllerFactory =
  (isSecondFactorAuthentication: boolean) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const email = isSecondFactorAuthentication
        ? getUserFromAuthenticatedSession(req).email
        : getEmailFromUnauthenticatedSession(req);

      if (!email) {
        return next(new HttpErrors.Unauthorized());
      }

      const { authenticationOptions } = await getAuthenticationOptions(
        email,
        isSecondFactorAuthentication,
      );

      return res.json(authenticationOptions);
    } catch (e) {
      next(e);
    }
  };

export const getGenerateAuthenticationOptionsForFirstFactorController =
  getGenerateAuthenticationOptionsControllerFactory(false);

export const getGenerateAuthenticationOptionsForSecondFactorController =
  getGenerateAuthenticationOptionsControllerFactory(true);

export const postVerifyAuthenticationController =
  (isSecondFactorVerification: boolean) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = z.object({
        webauthn_authentication_response_string: z.string(),
      });
      const { webauthn_authentication_response_string } =
        await schema.parseAsync(req.body);

      const authenticationResponseJson = JSON.parse(
        webauthn_authentication_response_string,
      );
      const authenticationResponseSchema =
        z.custom<AuthenticationResponseJSON>();

      const response = await authenticationResponseSchema.parseAsync(
        authenticationResponseJson,
      );

      const email = isSecondFactorVerification
        ? getUserFromAuthenticatedSession(req).email
        : getEmailFromUnauthenticatedSession(req);

      let { user, userVerified } = await verifyAuthentication({
        email,
        response,
        isSecondFactorVerification,
      });

      if (isSecondFactorVerification) {
        addAuthenticationMethodReferenceInSession(req, res, user, "pop");
      } else {
        user = await createAuthenticatedSession(req, res, user, "pop");
      }

      if (userVerified) {
        addAuthenticationMethodReferenceInSession(req, res, user, "uv");
      }

      next();
    } catch (e) {
      logger.error(e);
      if (
        e instanceof ZodError ||
        e instanceof WebauthnAuthenticationFailedError
      ) {
        return res.redirect(
          `/users/${isSecondFactorVerification ? "2fa-sign-in" : "sign-in-with-passkey"}?notification=invalid_passkey`,
        );
      }

      if (e instanceof NotFoundError) {
        return res.redirect(
          `/users/${isSecondFactorVerification ? "2fa-sign-in" : "sign-in-with-passkey"}?notification=passkey_not_found`,
        );
      }

      next(e);
    }
  };

export const postVerifyFirstFactorAuthenticationController =
  postVerifyAuthenticationController(false);

export const postVerifySecondFactorAuthenticationController =
  postVerifyAuthenticationController(true);
