import { NotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import type { User } from "@proconnect-gouv/proconnect.identite/types";
import {
  StrongLinkValues,
  SuperWeakLinkValues,
  UnverifiedLinkValues,
  WeakLinkValues,
} from "@proconnect-gouv/proconnect.identite/types";
import * as Sentry from "@sentry/node";
import type { Request, Response } from "express";
import { Session, type SessionData } from "express-session";
import { isEmpty } from "lodash-es";
import { match } from "ts-pattern";
import { RECENT_LOGIN_INTERVAL_IN_SECONDS } from "../../config/env";
import { UserNotLoggedInError } from "../../config/errors";
import { context } from "../../connectors/context";
import type { AssuranceLevels } from "../../services/acr-checks";
import { isExpiredInSeconds } from "../../services/is-expired";
import {
  addAuthenticationMethodReference,
  isOneFactorAuthenticated,
  isTwoFactorAuthenticated,
} from "../../services/security";
import type {
  AmrValue,
  AuthenticatedSessionData,
} from "../../types/express-session";
import {
  setBrowserAsTrustedForUser,
  setIsTrustedBrowserFromLoggedInSession,
} from "../browser-authentication";
import { hasValidFranceConnectIdentity } from "../user";

const { users_organizations, users } = context.repository;

export const isWithinAuthenticatedSession = (
  session: Session & Partial<SessionData>,
): session is Session & Partial<SessionData> & AuthenticatedSessionData => {
  // testing req.session.amr should suffice, but as this is quite critical,
  // we must be sure of what we are doing here
  return (
    session?.user !== undefined &&
    session.amr !== undefined &&
    isOneFactorAuthenticated(session.amr)
  );
};

const TRUSTED_AMR_VALUES: AmrValue[] = [
  "pop",
  "totp",
  "email-link",
  "email-otp",
];
export const createAuthenticatedSession = async (
  req: Request,
  res: Response,
  user: User,
  authenticationMethodReference: AmrValue,
): Promise<User> => {
  // we store old session value to pass it to the new logged-in session
  // email and needsInclusionconnectWelcomePage are not passed to the new session as it is not useful within logged session
  // csrfToken should not be passed to the new session for security reasons
  const {
    authForProconnectFederation,
    interactionId,
    nonce,
    redirectTo,
    state,
    prompt,
    certificationDirigeantRequested,
    spName,
    siretHint,
  } = req.session;

  return await new Promise((resolve, reject) => {
    // session will contain sensitive rights from now
    // we must regenerate session id to ensure it has not leaked
    req.session.regenerate(async (err) => {
      if (err) {
        reject(err);
      } else {
        const updatedUser = await users.update(user.id, {
          sign_in_count: user.sign_in_count + 1,
          last_sign_in_at: new Date(),
        });
        req.session.user = updatedUser;
        // we restore previous session navigation values
        req.session.interactionId = interactionId;
        req.session.prompt = prompt;
        req.session.redirectTo = redirectTo;
        req.session.authForProconnectFederation = authForProconnectFederation;
        req.session.certificationDirigeantRequested =
          certificationDirigeantRequested;
        // new session reset amr
        req.session.amr = [];
        req.session.nonce = nonce;
        req.session.state = state;
        req.session.spName = spName;
        req.session.siretHint = siretHint;

        req.session.amr = addAuthenticationMethodReference(
          req.session.amr,
          authenticationMethodReference,
        );

        if (TRUSTED_AMR_VALUES.includes(authenticationMethodReference)) {
          setBrowserAsTrustedForUser(req, res, user.id);
        } else {
          // as req.session.user has just been set,
          // this might alter the isTrustedBrowser flag on the req object.
          // We call this function to re-trigger the flag computation.
          setIsTrustedBrowserFromLoggedInSession(req);
        }

        resolve(updatedUser);
      }
    });
  });
};

export const addAuthenticationMethodReferenceInSession = (
  req: Request,
  res: Response,
  updatedUser: User,
  amr: AmrValue,
) => {
  if (!isWithinAuthenticatedSession(req.session)) {
    throw new UserNotLoggedInError();
  }

  updateUserInAuthenticatedSession(req, updatedUser);

  req.session.amr = addAuthenticationMethodReference(req.session.amr, amr);

  if (TRUSTED_AMR_VALUES.includes(amr)) {
    setBrowserAsTrustedForUser(req, res, updatedUser.id);
  }
};

export const getUserFromAuthenticatedSession = (req: Request) => {
  if (!isWithinAuthenticatedSession(req.session)) {
    throw new UserNotLoggedInError();
  }

  Sentry.setUser({
    email: req.session.user.email,
    id: req.session.user.id,
    ip_address: req.ip,
    username: `${req.session.user.given_name} ${req.session.user.family_name}`,
  });
  return req.session.user;
};

export const updateUserInAuthenticatedSession = (req: Request, user: User) => {
  if (
    !isWithinAuthenticatedSession(req.session) ||
    getUserFromAuthenticatedSession(req).id !== user.id
  ) {
    throw new UserNotLoggedInError();
  }

  Sentry.setUser({
    email: req.session.user.email,
    id: req.session.user.id,
    ip_address: req.ip,
    username: `${req.session.user.given_name} ${req.session.user.family_name}`,
  });
  req.session.user = user;
};

export const isWithinTwoFactorAuthenticatedSession = (req: Request) => {
  if (!isWithinAuthenticatedSession(req.session)) {
    return false;
  }

  return isTwoFactorAuthenticated(req.session.amr);
};

export const isPasskeyAuthenticatedSession = (req: Request) => {
  if (!isWithinAuthenticatedSession(req.session)) {
    return false;
  }

  return req.session.amr.includes("pop");
};

export const hasUserAuthenticatedRecently = (req: Request) => {
  if (!isWithinAuthenticatedSession(req.session)) {
    throw new UserNotLoggedInError();
  }

  return !isExpiredInSeconds(
    req.session.user.last_sign_in_at,
    RECENT_LOGIN_INTERVAL_IN_SECONDS,
  );
};

export const getSessionStandardizedAuthenticationMethodsReferences = (
  req: Request,
) => {
  if (!isWithinAuthenticatedSession(req.session)) {
    throw new UserNotLoggedInError();
  }

  let standardizedAmr: string[] = [...req.session.amr];

  standardizedAmr = standardizedAmr.filter((amr) => amr !== "uv");

  standardizedAmr = standardizedAmr.map((amr) =>
    amr === "email-link" || amr === "email-otp" ? "mail" : amr,
  );

  standardizedAmr = standardizedAmr.map((amr) =>
    amr === "totp" ? "otp" : amr,
  );

  // remove duplicate values
  standardizedAmr = [...new Set(standardizedAmr)];

  return standardizedAmr;
};

export const getSelectedOrganizationIdFromAuthenticatedSession = (
  req: Request,
) => {
  if (!isWithinAuthenticatedSession(req.session)) {
    throw new UserNotLoggedInError();
  }

  return req.session.selectedOrganizationId ?? null;
};

export const setSelectedOrganizationIdInAuthenticatedSession = (
  req: Request,
  organizationId: number,
) => {
  if (!isWithinAuthenticatedSession(req.session)) {
    throw new UserNotLoggedInError();
  }

  req.session.selectedOrganizationId = organizationId;
};

export const deleteSelectedOrganizationIdFromAuthenticatedSession = (
  req: Request,
) => {
  if (!isWithinAuthenticatedSession(req.session)) {
    throw new UserNotLoggedInError();
  }

  req.session.selectedOrganizationId = undefined;
};

export const destroyAuthenticatedSession = async (
  req: Request,
): Promise<null> => {
  return await new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) {
        reject(err);
      } else {
        resolve(null);
      }
    });
  });
};

export async function getCurrentIAL(
  req: Request,
): Promise<AssuranceLevels["ial"]> {
  const user = getUserFromAuthenticatedSession(req);

  const hasValidFCIdentity = await hasValidFranceConnectIdentity(user.id);

  return hasValidFCIdentity ? "low" : "declared";
}

export async function getCurrentAAL(
  req: Request,
): Promise<AssuranceLevels["aal"]> {
  const currentAmrValues = req.session.amr!;

  return currentAmrValues.includes("mfa") ? "multi_factor" : "single_factor";
}

export async function getCurrentOAL(
  req: Request,
  organizationId: number,
): Promise<AssuranceLevels["oal"]> {
  const user = getUserFromAuthenticatedSession(req);

  const link = await users_organizations.find({
    organization_id: organizationId,
    user_id: user.id,
  });

  if (isEmpty(link)) {
    throw new NotFoundError("link should be set");
  }

  return match(link.verification_type)
    .returnType<AssuranceLevels["oal"]>()
    .with(...UnverifiedLinkValues, () => "declared")
    .with(...WeakLinkValues, ...SuperWeakLinkValues, () => "moderated")
    .with(...StrongLinkValues, () => "certified")
    .exhaustive();
}

export async function doesAcrSatisfiesCertificationDirigeantRequirements(
  req: Request,
  organizationId: number,
) {
  const ial = await getCurrentIAL(req);
  const oal = await getCurrentOAL(req, organizationId);

  return match({ ial, oal })
    .with({ ial: "low", oal: "certified" }, () => true)
    .otherwise(() => false);
}

export async function getCurrentAssuranceLevels(
  req: Request,
  organizationId: number,
): Promise<AssuranceLevels> {
  return {
    aal: await getCurrentAAL(req),
    ial: await getCurrentIAL(req),
    oal: await getCurrentOAL(req, organizationId),
  };
}
