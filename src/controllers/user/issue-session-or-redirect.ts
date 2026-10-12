import { getTrustedReferrerPath } from "@proconnect-gouv/proconnect.core/security";
import type { NextFunction, Request, Response } from "express";
import { HOST } from "../../config/env";
import { logger, logger_group, logger_group_end } from "../../services/log";

const getRedirection = (redirectTo: string | undefined) => {
  if (!redirectTo) {
    return { code: "no_redirect_to_in_session", url: "/" };
  }
  if (!getTrustedReferrerPath(redirectTo, HOST)) {
    return { code: "untrusted_redirect_to_in_session", url: "/" };
  }
  return { code: "trusted_redirect_to_in_session", url: redirectTo };
};

export const issueSessionOrRedirectController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    logger_group(
      "🎫",
      req.method,
      req.originalUrl,
      issueSessionOrRedirectController.name,
    );

    const { redirectTo } = req.session;
    const { code, url } = getRedirection(redirectTo);

    logger.debug([code, "\n => redirect", url].join(" "));
    logger.trace({ redirectTo, code, url });
    logger_group_end();

    if (code === "trusted_redirect_to_in_session") {
      // then delete referer value from session
      req.session.redirectTo = undefined;
    }

    return res.redirect(url);
  } catch (error) {
    next(error);
  }
};
