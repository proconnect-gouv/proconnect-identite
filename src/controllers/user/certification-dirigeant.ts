//

import type { NextFunction, Request, Response } from "express";
import { csrfToken } from "../../middlewares/csrf-protection";

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
    });
  } catch (error) {
    next(error);
  }
}
