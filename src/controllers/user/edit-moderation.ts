import { NotFoundError } from "@gouvfr-lasuite/proconnect.identite/errors";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
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
      if (e instanceof NotFoundError) {
        return res.redirect(redirectUrl);
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
      if (e instanceof NotFoundError) {
        return res.redirect(redirectUrl);
      }
      next(e);
    }
  };
