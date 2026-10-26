import {
  ModerationNotFoundError,
  NotFoundError,
} from "@proconnect-gouv/proconnect.identite/errors";
import type { NextFunction, Request, Response } from "express";
import HttpErrors from "http-errors";
import { z } from "zod";
import { HOST } from "../../config/env";
import { ForbiddenError } from "../../config/errors";
import {
  cancelModeration,
  reopenModerationWithUserEdit,
} from "../../managers/moderation";
import { getUserFromAuthenticatedSession } from "../../managers/session/authenticated";
import { idSchema } from "../../services/custom-zod-schemas";

export const postCancelModerationAndRedirectControllerFactory =
  (redirectUrl: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = z.object({
        moderation_id: idSchema(),
      });
      const { moderation_id } = await schema.parseAsync(req.params);
      const user = getUserFromAuthenticatedSession(req);

      await cancelModeration({ user, moderation_id });

      return res.redirect(redirectUrl);
    } catch (e) {
      if (e instanceof ModerationNotFoundError || e instanceof NotFoundError) {
        const url = new URL(redirectUrl, HOST);
        url.searchParams.set("notification", "moderation_not_pending");

        return res.redirect(`${url.pathname}${url.search}`);
      }
      if (e instanceof ForbiddenError) {
        return next(new HttpErrors.Forbidden());
      }
      next(e);
    }
  };

export const postReopenModerationAndRedirectControllerFactory =
  (redirectUrl: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = z.object({
        moderation_id: idSchema(),
      });
      const { moderation_id } = await schema.parseAsync(req.params);
      const user = getUserFromAuthenticatedSession(req);

      await reopenModerationWithUserEdit({ user, moderation_id });

      return res.redirect(redirectUrl);
    } catch (e) {
      if (e instanceof ModerationNotFoundError || e instanceof NotFoundError) {
        const url = new URL(redirectUrl, HOST);
        url.searchParams.set("notification", "moderation_not_pending");

        return res.redirect(`${url.pathname}${url.search}`);
      }
      if (e instanceof ForbiddenError) {
        return next(new HttpErrors.Forbidden());
      }
      next(e);
    }
  };
