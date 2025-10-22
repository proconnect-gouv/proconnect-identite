//

import type { NextFunction, Request, Response } from "express";
import { csrfToken } from "../../middlewares/csrf-protection";
import { getNotificationsFromRequest } from "../../services/get-notifications-from-request";

//

export async function getCertificationDirigeantController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    return res.render("user/certification-dirigeant", {
      csrfToken: csrfToken(req),
      pageTitle: "Certification dirigeant",
      notifications: await getNotificationsFromRequest(req),
    });
  } catch (error) {
    next(error);
  }
}
