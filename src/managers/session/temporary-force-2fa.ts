import type { Request } from "express";
import { UserNotLoggedInError } from "../../config/errors";
import { isWithinAuthenticatedSession } from "./authenticated";

export const setTemporaryForce2Fa = (req: Request, force2fa: boolean) => {
  if (!isWithinAuthenticatedSession(req.session)) {
    throw new UserNotLoggedInError();
  }
  req.session.temporaryForce2fa = force2fa;
};

export const getTemporaryForce2Fa = (req: Request) => {
  if (!isWithinAuthenticatedSession(req.session)) {
    throw new UserNotLoggedInError();
  }
  return req.session.temporaryForce2fa ?? false;
};

export const deleteTemporaryForce2Fa = (req: Request) => {
  delete req.session.temporaryForce2fa;
};
