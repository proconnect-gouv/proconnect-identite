import { getTrustedReferrerPath } from "@proconnect-gouv/proconnect.core/security";
import type { NextFunction, Request, Response } from "express";
import { HOST } from "../../config/env";

export const issueSessionOrRedirectController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.session.interactionId) {
      return res.redirect(`/interaction/${req.session.interactionId}/login`);
    }

    if (
      req.session.referrerPath &&
      getTrustedReferrerPath(req.session.referrerPath, HOST)
    ) {
      // copy string by value
      const referrerPath = `${req.session.referrerPath}`;
      // then delete referer value from session
      req.session.referrerPath = undefined;
      return res.redirect(referrerPath);
    }

    return res.redirect("/");
  } catch (error) {
    next(error);
  }
};
