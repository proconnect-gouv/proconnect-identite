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
import { match, P } from "ts-pattern";
import { RECENT_LOGIN_INTERVAL_IN_SECONDS } from "../../config/env";
import { UserNotLoggedInError } from "../../config/errors";
import { getUserOrganizationLink } from "../../repositories/organization/getters";
import {
  deleteSelectedOrganizationId,
  getSelectedOrganizationId,
} from "../../repositories/redis/selected-organization";
import { update } from "../../repositories/user";
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
export const isWithinAuthenticatedSession = (
  session: Session & Partial<SessionData>,
): session is Session & Partial<SessionData> & AuthenticatedSessionData => {
  // testing req.session.amr should suffice, but as this is quite critical,
  // we must be sure of what we are doing here
  return (
    !isEmpty(session?.user) &&
    !isEmpty(session.amr) &&
    isOneFactorAuthenticated(session.amr!)
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
    mustReturnOneOrganizationInPayload,
    nonce,
    referrerPath,
    state,
    twoFactorsAuthRequested,
    certificationDirigeantRequested,
    spName,
    siretHint,
  } = req.session;

  // as selected org is not stored in session,
  // we delete this to avoid sync issues
  await deleteSelectedOrganizationId(user.id);

  return await new Promise((resolve, reject) => {
    // session will contain sensitive rights from now
    // we must regenerate session id to ensure it has not leaked
    req.session.regenerate(async (err) => {
      if (err) {
        reject(err);
      } else {
        const updatedUser = await update(user.id, {
          sign_in_count: user.sign_in_count + 1,
          last_sign_in_at: new Date(),
        });
        req.session.user = updatedUser;
        // we restore previous session navigation values
        req.session.interactionId = interactionId;
        req.session.mustReturnOneOrganizationInPayload =
          mustReturnOneOrganizationInPayload;
        req.session.twoFactorsAuthRequested = twoFactorsAuthRequested;
        req.session.referrerPath = referrerPath;
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
  return req.session.user as User;
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

  standardizedAmr = standardizedAmr.filter(
    (amr) => amr !== "uv" && amr !== "email-otp",
  );

  standardizedAmr = standardizedAmr.map((amr) =>
    amr === "email-link" ? "mail" : amr,
  );

  return standardizedAmr;
};

export const destroyAuthenticatedSession = async (
  req: Request,
): Promise<null> => {
  if (isWithinAuthenticatedSession(req.session)) {
    await deleteSelectedOrganizationId(getUserFromAuthenticatedSession(req).id);
  }

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

// Get the current Identity Assurance Level
// 0: Déclaratif
// 1: Faible (eg. FranceConnect niveau eidas1)
// 2: Substantiel (eg. FranceConnect niveau eidas2) (not available yet)
// 3: Élevé (eg. FranceConnect niveau eidas3) (not available yet)
export async function getCurrentIAL(req: Request) {
  const user = getUserFromAuthenticatedSession(req);

  const hasValidFCIdentity = await hasValidFranceConnectIdentity(user.id);

  return hasValidFCIdentity ? 1 : 0;
}

// get the current Authentication Assurance Level
// 0: Simple (mot de passe)
// 1: MFA (auto-géré)
// 2. MFA (géré par l'organisation) (not available yet)
// 3. MFA matérielle (géré par l'organisation) (not available yet)
export async function getCurrentAAL(req: Request) {
  const currentAmrValues = req.session.amr!;

  return currentAmrValues.includes("mfa") ? 1 : 0;
}

// get the current Organization Assurance Level
// 0: Déclaratif
// 1: Modération
// 2: Lien certifié par une source officielle
export async function getCurrentOAL(req: Request) {
  if (!req.session.mustReturnOneOrganizationInPayload) {
    // The OAL should reflect the minimum verification level across all organizations associated with the user.
    // This calculation is complex, and support for multiple organizations should be deprecated soon.
    // We return a "moderated" OAL to avoid triggering the safeguard that prevents both OAL and IAL from being zero simultaneously.
    return 1;
  }

  const user = getUserFromAuthenticatedSession(req);
  const selectedOrganizationId = await getSelectedOrganizationId(user.id);

  if (selectedOrganizationId === null) {
    throw new Error("selectedOrganizationId should be set");
  }

  const link = await getUserOrganizationLink(selectedOrganizationId, user.id);

  if (isEmpty(link)) {
    throw new NotFoundError("link should be set");
  }

  return match(link.verification_type)
    .returnType<0 | 1 | 2>()
    .with(...UnverifiedLinkValues, () => 0)
    .with(...WeakLinkValues, ...SuperWeakLinkValues, () => 1)
    .with(...StrongLinkValues, () => 2)
    .exhaustive();
}

export async function getCurrentAcr(req: Request) {
  const ial = await getCurrentIAL(req);
  const aal = await getCurrentAAL(req);
  const oal = await getCurrentOAL(req);

  return (
    match({
      ial,
      aal,
      oal,
    })
      .with({ ial: 0, oal: 0 }, () => {
        throw new Error("Identity and Organization assurance level too low");
      })
      .with(
        { ial: 1, aal: 0, oal: 0 },
        { ial: 0, aal: 0, oal: 1 },
        () => "eidas0",
      )
      .with(
        { ial: 1, aal: 1, oal: 0 },
        { ial: 0, aal: 1, oal: 1 },
        () => "eidas0-mfa",
      )
      // This is a legacy ACR level.
      // It should be removed once the certification dirigeant is controlled with the `roles` claims.
      // Once implemented, OAL 2 will be treated as eidas1 and eidas1-mfa.
      .with(
        { ial: 1, oal: 2 },
        () => "https://proconnect.gouv.fr/assurance/certification-dirigeant",
      )
      .with({ ial: 1, aal: 0, oal: P.union(1, 2) }, () => "eidas1")
      .with({ ial: 1, aal: 1, oal: P.union(1, 2) }, () => "eidas1-mfa")
      .with({ ial: 0, oal: 2 }, () => {
        // Cas d'une certification dirigeant/employé sans FranceConnection
        throw new Error("not possible");
      })
      .exhaustive()
  );
}
