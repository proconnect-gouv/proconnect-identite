import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { eq, sql } from "drizzle-orm";
import type { Request } from "express";
import { isEmpty } from "lodash-es";
import { NoEmailFoundInUnauthenticatedSessionError } from "../../config/errors";
import { context, db } from "../../connectors/context";

const { users } = context.repository;

export const getAndRemoveLoginHintFromUnauthenticatedSession = (
  req: Request,
) => {
  const loginHint = req.session.loginHint;
  delete req.session.loginHint;
  return loginHint;
};
export const setSiretHintInUnauthenticatedSession = (
  req: Request,
  siretHint: string,
) => {
  req.session.siretHint = siretHint;

  return siretHint;
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

  const user = await users.findByEmail(req.session.email);

  if (isEmpty(user)) {
    return null;
  }

  await db
    .update(schema.users)
    .set({ needs_inclusionconnect_welcome_page, updated_at: sql`now()` })
    .where(eq(schema.users.id, user!.id));

  return { email: req.session.email, needs_inclusionconnect_welcome_page };
};
