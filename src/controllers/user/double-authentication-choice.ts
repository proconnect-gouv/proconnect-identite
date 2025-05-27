import type { NextFunction, Request, Response } from "express";
import { csrfToken } from "../../middlewares/csrf-protection";

export const getDoubleAuthenticationChoiceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    return res.render("user/double-authentication-choice", {
      pageTitle: "Double authentification test",
      csrfToken: csrfToken(req),
      illustration: "illu-2FA.svg",
    });
  } catch (error) {
    next(error);
  }
};
