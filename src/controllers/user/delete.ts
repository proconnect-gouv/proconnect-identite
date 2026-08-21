import type { NextFunction, Request, Response } from "express";
import { context } from "../../connectors/context";
import {
  destroyAuthenticatedSession,
  getUserFromAuthenticatedSession,
} from "../../managers/session/authenticated";
import { sendDeleteUserEmail } from "../../managers/user";
import { logger } from "../../services/log";

const { delete: deleteUser } = context.repository.users;

export const postDeleteUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, email } = getUserFromAuthenticatedSession(req);

    await sendDeleteUserEmail({ user_id: id });

    await deleteUser(id);
    logger.info(`user ${email} successfully deleted`);

    await destroyAuthenticatedSession(req);

    return res.redirect(
      `/users/start-sign-in?notification=user_successfully_deleted`,
    );
  } catch (error) {
    next(error);
  }
};
