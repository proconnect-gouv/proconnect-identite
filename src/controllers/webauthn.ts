import { NotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/server";
import type { NextFunction, Request, Response } from "express";
import HttpErrors from "http-errors";
import { z, ZodError } from "zod/v4";
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
  renameUserAuthenticator,
  verifyAuthentication,
  verifyRegistration,
} from "../managers/webauthn";
import { mfaDisplayNameSchema } from "../services/custom-zod-schemas";
import { logger, track } from "../services/log";

export const deletePasskeyController = async (req: Request, res: Response) => {
  const schema = z.object({
    credential_id: z.string(),
  });
  const { credential_id } = schema.parse(req.params);

  const { email, id: user_id } = getUserFromAuthenticatedSession(req);

  const key_name = await deleteUserAuthenticator(email, credential_id);

  await sendDeleteAccessKeyMail({
    user_id,
    key_name,
  });

  return res.redirect(
    `/connection-and-account?notification=passkey_successfully_deleted`,
  );
};
export const renamePasskeyController = async (req: Request, res: Response) => {
  const { credential_id } = z
    .object({ credential_id: z.string() })
    .parse(req.params);
  const { passkeyDisplayName } = z
    .object({ passkeyDisplayName: mfaDisplayNameSchema() })
    .parse(req.body);

  const { id: user_id } = getUserFromAuthenticatedSession(req);

  await renameUserAuthenticator(user_id, credential_id, passkeyDisplayName);

  return res.redirect(
    "/connection-and-account?notification=passkey_successfully_renamed",
  );
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

export const postVerifyRegistrationMiddlewareFactory =
  ({
    successRedirectUrl,
    errorRedirectUrl,
  }: {
    successRedirectUrl?: string;
    errorRedirectUrl: string;
  }) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = z.object({
        webauthn_registration_response_string: z.string(),
      });
      const { webauthn_registration_response_string } = schema.parse(req.body);

      const response = z
        .preprocess(
          (val) => (typeof val === "string" ? JSON.parse(val) : val),
          z.custom<RegistrationResponseJSON>(),
        )
        .parse(webauthn_registration_response_string);
      const { email, id: user_id } = getUserFromAuthenticatedSession(req);

      const { userVerified, updatedUser, key_name } = await verifyRegistration({
        email: email,
        response,
      });
      addAuthenticationMethodReferenceInSession(req, res, updatedUser, "pop");
      if (userVerified) {
        addAuthenticationMethodReferenceInSession(req, res, updatedUser, "uv");
      }
      await sendActivateAccessKeyMail({
        user_id,
        key_name: key_name ?? undefined,
      });

      req.session.pendingGreetingsForConfiguredMfa = true;

      if (successRedirectUrl) {
        return res.redirect(successRedirectUrl);
      }

      return next();
    } catch (e) {
      logger.error(e);
      if (e instanceof ZodError) {
        return res.redirect(errorRedirectUrl);
      }

      if (e instanceof WebauthnRegistrationFailedError) {
        track("webauthn.registration.verification_failed", {
          "error.type": e.name,
        });
        return res.redirect(errorRedirectUrl);
      }

      next(e);
    }
  };

export const getGenerateAuthenticationOptionsControllerFactory =
  (isSecondFactorAuthentication: boolean) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const email = isSecondFactorAuthentication
      ? getUserFromAuthenticatedSession(req).email
      : getEmailFromUnauthenticatedSession(req);

    if (!email) {
      track("webauthn.authentication_options.email_missing", {});
      return next(new HttpErrors.Unauthorized());
    }

    const { authenticationOptions } = await getAuthenticationOptions(
      email,
      isSecondFactorAuthentication,
    );

    return res.json(authenticationOptions);
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
      const { webauthn_authentication_response_string } = schema.parse(
        req.body,
      );

      const authenticationResponseJson = JSON.parse(
        webauthn_authentication_response_string,
      );
      const authenticationResponseSchema =
        z.custom<AuthenticationResponseJSON>();

      const response = authenticationResponseSchema.parse(
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
          `/users/${isSecondFactorVerification ? "2fa-sign-in" : "sign-in"}?notification=invalid_passkey`,
        );
      }

      if (e instanceof NotFoundError) {
        return res.redirect(
          `/users/${isSecondFactorVerification ? "2fa-sign-in" : "sign-in"}?notification=passkey_not_found`,
        );
      }

      next(e);
    }
  };

export const postVerifyFirstFactorAuthenticationController =
  postVerifyAuthenticationController(false);

export const postVerifySecondFactorAuthenticationController =
  postVerifyAuthenticationController(true);
