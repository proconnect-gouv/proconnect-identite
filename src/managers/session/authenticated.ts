import { NotFoundError } from "@gouvfr-lasuite/proconnect.identite/errors";
import type { User } from "@gouvfr-lasuite/proconnect.identite/types";
import * as Sentry from "@sentry/node";
import type { Request, Response } from "express";
import { Session, type SessionData } from "express-session";
import { isEmpty } from "lodash-es";
import { match } from "ts-pattern";
import {
  ACR_VALUE_FOR_CERTIFICATION_DIRIGEANT,
  ACR_VALUE_FOR_IAL1_AAL1,
  ACR_VALUE_FOR_IAL1_AAL2,
  ACR_VALUE_FOR_IAL2_AAL1,
  ACR_VALUE_FOR_IAL2_AAL2,
  RECENT_LOGIN_INTERVAL_IN_SECONDS,
} from "../../config/env";
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

export const isIdentityConsistencyChecked = async (req: Request) => {
  if (!req.session.mustReturnOneOrganizationInPayload) {
    // identity is always considered as self-asserted for legacy payloads
    return false;
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

  const askForExecutiveCertification = Boolean(
    req.session.certificationDirigeantRequested,
  );
  const hasValidVerificationType = [
    "code_sent_to_official_contact_email",
    "domain",
    "imported_from_inclusion_connect",
    "imported_from_coop_mediation_numerique",
    "in_liste_dirigeants_rna",
    "official_contact_email",
    "bypassed",
  ].includes(link?.verification_type ?? "");

  return match({
    isOrganizationExecutive: link.is_executive,
    askForExecutiveCertification,
    hasValidVerificationType,
  })
    .with(
      {
        askForExecutiveCertification: true,
        isOrganizationExecutive: true,
      },
      { hasValidVerificationType: true },
      () => true,
    )
    .otherwise(() => false);
};

// get the current Identity Assurance Level (e.g. self-asserted, consistency-checked, certified)
export async function getCurrentIAL(req: Request) {
  if (!req.session.mustReturnOneOrganizationInPayload) {
    // identity is always considered as self-asserted for legacy payloads
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

  if (link.is_executive) {
    return 3;
  }

  const hasConsistencyCheckVerificationType = [
    "code_sent_to_official_contact_email",
    "domain",
    "imported_from_inclusion_connect",
    "imported_from_coop_mediation_numerique",
    "in_liste_dirigeants_rna",
    "official_contact_email",
    "bypassed",
  ].includes(link?.verification_type ?? "");

  if (hasConsistencyCheckVerificationType) {
    return 2;
  }

  return 1;
}

// get the current Authentication Assurance Level (e.g. password, 2 factor, carte agent, etc.)
export async function getCurrentAAL(req: Request) {
  const currentAmrValues = req.session.amr!;

  if (currentAmrValues.includes("hwk")) {
    return 3;
  }

  if (currentAmrValues.includes("mfa")) {
    return 2;
  }

  return 1;
}

export async function getCurrentAcr(req: Request) {
  const ial = await getCurrentIAL(req);
  const aal = await getCurrentAAL(req);

  return (
    match({
      ial,
      aal,
    })
      // ial: "carte agent" & aal: "carte agent" => acr: "eidas3" (alias: certification-dirigeant)
      .with({ ial: 3, aal: 3 }, () => {
        throw new Error("not implemented");
      })
      // ial: "certified" (FC+ + source authentique) & aal: "mfa" => acr: "eidas2"
      .with({ ial: 3, aal: 2 }, () => {
        throw new Error("not implemented");
      })
      // ial: "consistency-checked" & aal: "mfa" => acr: "consistency-checked-mfa"
      .with({ ial: 2, aal: 2 }, () => ACR_VALUE_FOR_IAL2_AAL2)
      // ial: "self-asserted" & aal: "mfa" => acr: "self-asserted-mfa"
      .with({ ial: 1, aal: 2 }, () => ACR_VALUE_FOR_IAL1_AAL2)
      // ial: "certified" (FC + source authentique) & aal: "pwd" => acr: "certification-dirigeant"
      .with({ ial: 3, aal: 1 }, () => ACR_VALUE_FOR_CERTIFICATION_DIRIGEANT)
      // ial: "consistency-checked" & aal: "pwd" => acr: "consistency-checked"
      .with({ ial: 2, aal: 1 }, () => ACR_VALUE_FOR_IAL2_AAL1)
      // ial: "self-asserted" & aal: "pwd" => acr: "self-asserted"
      .with({ ial: 1, aal: 1 }, () => ACR_VALUE_FOR_IAL1_AAL1)
      // ial: 1 "self-asserted" & all: 3 "carte-agent" => server_error (HTTP error code 500)
      // ial: 2 "consistency-checked" & all: 3 "carte-agent" => server_error (HTTP error code 500)
      .exhaustive()
  );
}
