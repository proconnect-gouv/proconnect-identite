import type { Request } from "express";
import { isEmpty } from "lodash-es";
import { NoEmailFoundInUnauthenticatedSessionError } from "../../config/errors";
import { findByEmail, update } from "../../repositories/user";

export const getAndRemoveLoginHintFromUnauthenticatedSession = (
  req: Request,
) => {
  const loginHint = req.session.loginHint;
  delete req.session.loginHint;
  return loginHint;
};
export const setLoginHintInUnauthenticatedSession = (
  req: Request,
  loginHint: string,
) => {
  req.session.loginHint = loginHint;

  return loginHint;
};
export const getEmailFromUnauthenticatedSession = (req: Request) => {
  return req.session.email;
};
export const setEmailInUnauthenticatedSession = (
  req: Request,
  email: string,
) => {
  req.session.email = email;

  return email;
};
export const getPartialUserFromUnauthenticatedSession = (req: Request) => {
  return {
    email: req.session.email,
    needsInclusionconnectWelcomePage:
      req.session.needsInclusionconnectWelcomePage,
    hasWebauthnConfigured: req.session.hasWebauthnConfigured,
  };
};
export const setPartialUserFromUnauthenticatedSession = (
  req: Request,
  {
    email,
    needsInclusionconnectWelcomePage,
    hasWebauthnConfigured,
  }: {
    email: string;
    needsInclusionconnectWelcomePage: boolean;
    hasWebauthnConfigured: boolean;
  },
) => {
  req.session.email = email;
  req.session.needsInclusionconnectWelcomePage =
    needsInclusionconnectWelcomePage;
  req.session.hasWebauthnConfigured = hasWebauthnConfigured;
};
export const updatePartialUserFromUnauthenticatedSession = async (
  req: Request,
  {
    needs_inclusionconnect_welcome_page,
  }: { needs_inclusionconnect_welcome_page: boolean },
): Promise<null | {
  email: string;
  needs_inclusionconnect_welcome_page: boolean;
}> => {
  if (!req.session.email) {
    throw new NoEmailFoundInUnauthenticatedSessionError();
  }

  req.session.needsInclusionconnectWelcomePage =
    needs_inclusionconnect_welcome_page;

  const user = await findByEmail(req.session.email);

  if (isEmpty(user)) {
    return null;
  }

  await update(user!.id, { needs_inclusionconnect_welcome_page });

  return { email: req.session.email, needs_inclusionconnect_welcome_page };
};
