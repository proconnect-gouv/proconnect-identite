import { NotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import type { NextFunction, Request, Response } from "express";
import { match } from "ts-pattern";
import { z } from "zod";
import { InvalidTotpTokenError } from "../config/errors";
import { runtime } from "../connectors/context";
import {
  addAuthenticationMethodReferenceInSession,
  getUserFromAuthenticatedSession,
  updateUserInAuthenticatedSession,
} from "../managers/session/authenticated";
import {
  deleteTemporaryTotpKey,
  getTemporaryTotpKey,
  setTemporaryTotpKey,
} from "../managers/session/temporary-totp-key";
import {
  authenticateWithTotp,
  generateTotpRegistrationOptions,
  isTotpConfiguredForUser,
} from "../managers/totp";
import {
  sendAddFreeTOTPEmail,
  sendDeleteFreeTOTPApplicationEmail,
} from "../managers/user";
import { csrfToken } from "../middlewares/csrf-protection";
import { codeSchema } from "../services/custom-zod-schemas";
import getNotificationsFromRequest, {
  getNotificationLabelFromRequest,
} from "../services/get-notifications-from-request";

export const getTotpConfigurationControllerFactory =
  ({
    template,
  }: {
    template: "user/totp-configuration" | "totp-configuration";
  }) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id: user_id, email } = getUserFromAuthenticatedSession(req);

      const existingTemporaryTotpKey = getTemporaryTotpKey(req);

      const { totpKey, humanReadableTotpKey, qrCodeDataUrl } =
        await generateTotpRegistrationOptions(email, existingTemporaryTotpKey);

      setTemporaryTotpKey(req, totpKey);

      const notificationLabel = await getNotificationLabelFromRequest(req);
      const hasCodeError = notificationLabel === "invalid_totp_token";

      const { "totp-tool-type": totpToolType } = req.query;

      return res.render(template, {
        pageTitle: "Configurer un code à usage unique",
        notifications: await getNotificationsFromRequest(req),
        hasCodeError,
        csrfToken: csrfToken(req),
        isAuthenticatorAlreadyConfigured:
          await isTotpConfiguredForUser(user_id),
        humanReadableTotpKey,
        qrCodeDataUrl,
        totpToolType,
      });
    } catch (error) {
      next(error);
    }
  };

export const postTotpConfigurationMiddlewareFactory =
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
        totpToken: codeSchema(),
      });
      const { totpToken } = await schema.parseAsync(req.body);

      const { id: user_id } = getUserFromAuthenticatedSession(req);
      const temporaryTotpKey = getTemporaryTotpKey(req);

      if (!temporaryTotpKey) {
        throw new NotFoundError();
      }

      const outcome = await runtime
        .as({ type: "user", user_id })
        .user.totp_added.mutate({
          temporary_totp_key: temporaryTotpKey,
          totp_token: totpToken,
          user_id,
        });

      const updatedUser = match(outcome)
        .with({ kind: "invalid_totp_token" }, () => {
          throw new InvalidTotpTokenError();
        })
        .with({ kind: "totp_added" }, ({ user }) => user)
        .exhaustive();

      deleteTemporaryTotpKey(req);
      addAuthenticationMethodReferenceInSession(req, res, updatedUser, "totp");

      await sendAddFreeTOTPEmail({ user_id });

      req.session.pendingGreetingsForConfiguredMfa = true;

      if (successRedirectUrl) {
        return res.redirect(successRedirectUrl);
      }

      return next();
    } catch (error) {
      if (error instanceof InvalidTotpTokenError) {
        const { "totp-tool-type": totpToolType } = req.body;
        const totpToolTypeParam = totpToolType
          ? `&totp-tool-type=${encodeURIComponent(totpToolType)}`
          : "";
        return res.redirect(`${errorRedirectUrl}${totpToolTypeParam}`);
      }

      next(error);
    }
  };

export const postDeleteTotpConfigurationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: user_id } = getUserFromAuthenticatedSession(req);

    const outcome = await runtime
      .as({ type: "user", user_id })
      .user.totp_removed.mutate({ source: "self", user_id });

    const updatedUser = match(outcome)
      .with({ kind: "totp_not_configured" }, ({ user }) => user)
      .with({ kind: "totp_removed" }, ({ user }) => user)
      .exhaustive();

    updateUserInAuthenticatedSession(req, updatedUser);

    await sendDeleteFreeTOTPApplicationEmail({ user_id });

    return res.redirect(
      `/connection-and-account?notification=authenticator_successfully_deleted`,
    );
  } catch (error) {
    next(error);
  }
};

export const postSignInWithTotpController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      totpToken: codeSchema(),
    });

    const { totpToken } = await schema.parseAsync(req.body);

    const { id: user_id } = getUserFromAuthenticatedSession(req);

    const user = await authenticateWithTotp(user_id, totpToken);

    addAuthenticationMethodReferenceInSession(req, res, user, "totp");

    return next();
  } catch (error) {
    if (error instanceof InvalidTotpTokenError) {
      return res.redirect("/users/2fa-sign-in?notification=invalid_totp_token");
    }
    next(error);
  }
};
