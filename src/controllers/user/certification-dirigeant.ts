//

import type { NextFunction, Request, Response } from "express";
import { getUserFromAuthenticatedSession } from "../../managers/session/authenticated";
import { isUserVerifiedWithFranceconnect } from "../../managers/user";
import { csrfToken } from "../../middlewares/csrf-protection";

//

export async function getCertificationDirigeantController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id: userId } = getUserFromAuthenticatedSession(req);
    const isVerified = await isUserVerifiedWithFranceconnect(userId);

    return res.render("user/certification-dirigeant", {
      csrfToken: csrfToken(req),
      pageTitle: "Certification dirigeant",
      requiresVerification: !isVerified,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCertificationDirigeantConfirmController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    req.session.passCertificationPage = true;
    return res.redirect("/users/select-organization");
  } catch (error) {
    next(error);
  }
}
