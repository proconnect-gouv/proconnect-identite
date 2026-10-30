import type { NextFunction, Request, Response } from "express";
import { runtime } from "../../connectors/context";
import {
  destroyAuthenticatedSession,
  getUserFromAuthenticatedSession,
} from "../../managers/session/authenticated";
import { sendDeleteUserEmail } from "../../managers/user";
import { logger } from "../../services/log";

export const postDeleteUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: user_id } = getUserFromAuthenticatedSession(req);

    const deletion = await runtime
      .as({ type: "user", user_id })
      .deleteUser({ user_id });

    await destroyAuthenticatedSession(req);

    if (deletion.kind === "user_not_found") {
      return res.redirect("/users/start-sign-in");
    }

    logger.info(`user ${deletion.previous.email} successfully deleted`);
    await sendDeleteUserEmail(deletion.previous);

    return res.redirect(
      `/users/start-sign-in?notification=user_successfully_deleted`,
    );
  } catch (error) {
    next(error);
  }
};
