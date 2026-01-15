import { getTrustedReferrerPath } from "@proconnect-gouv/proconnect.core/security";
import type { User } from "@proconnect-gouv/proconnect.identite/types";
import type { Request, RequestHandler } from "express";
import HttpErrors from "http-errors";
import { isEmpty } from "lodash-es";
import {
  CERTIFICATION_DIRIGEANT_MAX_AGE_IN_MINUTES,
  FEATURE_CONSIDER_ALL_USERS_AS_CERTIFIED,
  HOST,
} from "../config/env";
import {
  CertificationDirigeantCloseMatchError,
  CertificationDirigeantNoMatchError,
  CertificationDirigeantOrganizationNotCoveredError,
} from "../config/errors";
import { is2FACapable, shouldForce2faForUser } from "../managers/2fa";
import { isBrowserTrustedForUser } from "../managers/browser-authentication";
import {
  getCertificationDirigeantCloseMatchErrorUrl,
  processCertificationDirigeantOrThrow,
} from "../managers/certification";
import {
  greetForCertification,
  greetForJoiningOrganization,
} from "../managers/organization/join";
import {
  getOrganizationById,
  getOrganizationBySiret,
  getOrganizationsByUserId,
  selectOrganization,
} from "../managers/organization/main";
import {
  getUserFromAuthenticatedSession,
  hasUserAuthenticatedRecently,
  isWithinAuthenticatedSession,
  isWithinTwoFactorAuthenticatedSession,
} from "../managers/session/authenticated";
import {
  getEmailFromUnauthenticatedSession,
  getPartialUserFromUnauthenticatedSession,
} from "../managers/session/unauthenticated";
import {
  isUserVerifiedWithFranceconnect,
  needsEmailVerificationRenewal,
} from "../managers/user";
import { getUserOrganizationLink } from "../repositories/organization/getters";
import { updateUserOrganizationLink } from "../repositories/organization/setters";
import { getSelectedOrganizationId } from "../repositories/redis/selected-organization";
import { getFranceConnectUserInfo } from "../repositories/user";
import { addQueryParameters } from "../services/add-query-parameters";
import { isExpired } from "../services/is-expired";
import { usesAuthHeaders } from "../services/uses-auth-headers";

const getReferrerPath = (req: Request) => {
  // If the method is not GET (ex: POST), then the referrer must be taken from
  // the referrer header. This ensures the referrerPath can be redirected to.
  const originPath =
    req.method === "GET" ? getTrustedReferrerPath(req.originalUrl, HOST) : null;
  const referrerPath = getTrustedReferrerPath(req.get("Referrer"), HOST);

  return originPath || referrerPath || undefined;
};

type Redirect = { redirect: string };
type Send = { send: true };
type Pass<T> = { ok: true } & T;
type GuardResult<T> = Pass<T> | Redirect | Send;

function middleware<T>(
  fn: (req: Request) => Promise<GuardResult<T>>,
): RequestHandler {
  return async (req, res, next) => {
    const result = await fn(req);
    if ("redirect" in result) return res.redirect(result.redirect);
    if ("send" in result) return res.send();
    next();
  };
}

export async function requireIsUser(req: Request): Promise<GuardResult<{}>> {
  if (usesAuthHeaders(req)) {
    throw new HttpErrors.Forbidden(
      "Access denied. The requested resource does not require authentication.",
    );
  }
  return { ok: true };
}

export const guard = {
  admin: middleware(requireUserTwoFactorAuthForAdmin),
  browserTrusted: middleware(requireBrowserIsTrusted),
  connected: middleware(requireUserIsConnected),
  connectedRecently: middleware(requireUserHasConnectedRecently),
  credentialPromptReady: middleware(requireCredentialPromptRequirements),
  emailInSession: middleware(requireEmailInSession),
  hasAtLeastOneOrganization: middleware(requireUserHasAtLeastOneOrganization),
  hasSelectedAnOrganization: middleware(requireUserHasSelectedAnOrganization),
  isUser: middleware(requireIsUser),
  loggedInRecently: middleware(requireUserHasLoggedInRecently),
  signInRequirements: middleware(
    requireUserHasBeenGreetedForJoiningOrganization,
  ),
  verified: middleware(requireUserIsVerified),
};

export async function requireEmailInSession(
  req: Request,
): Promise<GuardResult<{ email: string }>> {
  const prev = await requireIsUser(req);
  if (!("ok" in prev)) return prev;

  const email = getEmailFromUnauthenticatedSession(req);
  if (isEmpty(email)) {
    return { redirect: "/users/start-sign-in" };
  }

  return { ok: true, email: email! };
}

export async function requireCredentialPromptRequirements(
  req: Request,
): Promise<GuardResult<{ email: string }>> {
  const prev = await requireEmailInSession(req);
  if (!("ok" in prev)) return prev;

  if (
    getPartialUserFromUnauthenticatedSession(req)
      .needsInclusionconnectWelcomePage
  ) {
    return { redirect: "/users/inclusionconnect-welcome" };
  }

  return prev;
}

export async function requireUserIsConnected(
  req: Request,
): Promise<GuardResult<{ user: User }>> {
  const prev = await requireIsUser(req);
  if (!("ok" in prev)) return prev;

  if (req.method === "HEAD") {
    return { send: true };
  }

  if (!isWithinAuthenticatedSession(req.session)) {
    const referrerPath = getReferrerPath(req);
    if (referrerPath) {
      req.session.referrerPath = referrerPath;
    }
    return { redirect: "/users/start-sign-in" };
  }

  const user = getUserFromAuthenticatedSession(req);
  return { ok: true, user };
}

export async function requireUserHasConnectedRecently(
  req: Request,
): Promise<GuardResult<{ user: User }>> {
  const prev = await requireUserIsConnected(req);
  if (!("ok" in prev)) return prev;

  const hasLoggedInRecently = hasUserAuthenticatedRecently(req);

  if (!hasLoggedInRecently) {
    req.session.referrerPath = getReferrerPath(req);
    return { redirect: `/users/start-sign-in?notification=login_required` };
  }

  return prev;
}

export async function requireUserIsVerified(
  req: Request,
): Promise<GuardResult<{ user: User }>> {
  const prev = await requireUserIsConnected(req);
  if (!("ok" in prev)) return prev;

  const { email, email_verified } = prev.user;
  const needs_email_verification_renewal =
    await needsEmailVerificationRenewal(email);

  if (!email_verified || needs_email_verification_renewal) {
    let notification_param = "";
    if (needs_email_verification_renewal) {
      notification_param = "?notification=email_verification_renewal";
    }
    return { redirect: `/users/verify-email${notification_param}` };
  }

  return prev;
}

async function requireUserTwoFactorAuth(
  req: Request,
): Promise<GuardResult<{ user: User }>> {
  const prev = await requireUserIsVerified(req);
  if (!("ok" in prev)) return prev;

  const { id: user_id } = prev.user;
  if (
    ((await shouldForce2faForUser(user_id)) ||
      req.session.twoFactorsAuthRequested) &&
    !isWithinTwoFactorAuthenticatedSession(req)
  ) {
    if (await is2FACapable(user_id)) {
      return { redirect: "/users/2fa-sign-in" };
    } else {
      return { redirect: "/users/double-authentication-choice" };
    }
  }

  return prev;
}

export async function requireBrowserIsTrusted(
  req: Request,
): Promise<GuardResult<{ user: User }>> {
  const prev = await requireUserTwoFactorAuth(req);
  if (!("ok" in prev)) return prev;

  if (!isBrowserTrustedForUser(req)) {
    return { redirect: "/users/verify-email?notification=browser_not_trusted" };
  }

  return prev;
}

export const requireUserCanAccessApp = requireBrowserIsTrusted;

export async function requireUserHasLoggedInRecently(
  req: Request,
): Promise<GuardResult<{ user: User }>> {
  const prev = await requireUserCanAccessApp(req);
  if (!("ok" in prev)) return prev;

  const hasLoggedInRecently = hasUserAuthenticatedRecently(req);

  if (!hasLoggedInRecently) {
    req.session.referrerPath = getReferrerPath(req);
    return { redirect: `/users/start-sign-in?notification=login_required` };
  }

  return prev;
}

export async function requireUserTwoFactorAuthForAdmin(
  req: Request,
): Promise<GuardResult<{ user: User }>> {
  const prev = await requireUserHasLoggedInRecently(req);
  if (!("ok" in prev)) return prev;

  const { id: user_id } = prev.user;

  if (
    (await is2FACapable(user_id)) &&
    !isWithinTwoFactorAuthenticatedSession(req)
  ) {
    req.session.referrerPath = getReferrerPath(req);
    return { redirect: "/users/2fa-sign-in?notification=2fa_required" };
  }

  return prev;
}

export const requireUserCanAccessAdmin = requireUserTwoFactorAuthForAdmin;

export async function requireUserHasAtLeastOneOrganization(
  req: Request,
): Promise<GuardResult<{ user: User }>> {
  const prev = await requireBrowserIsTrusted(req);
  if (!("ok" in prev)) return prev;

  if (!req.session.interactionId) return prev;

  if (isEmpty(await getOrganizationsByUserId(prev.user.id))) {
    return {
      redirect: addQueryParameters("/users/join-organization", {
        siret_hint: req.session.siretHint,
      }),
    };
  }

  return prev;
}

async function requireUserBelongsToHintedOrganization(
  req: Request,
): Promise<GuardResult<{ user: User }>> {
  const prev = await requireUserHasAtLeastOneOrganization(req);
  if (!("ok" in prev)) return prev;

  if (!req.session.interactionId) return prev;
  if (!req.session.siretHint) return prev;

  const hintedOrganization = await getOrganizationBySiret(
    req.session.siretHint,
  );
  const userOrganisations = await getOrganizationsByUserId(prev.user.id);

  if (
    !isEmpty(hintedOrganization) &&
    userOrganisations.some((org) => org.id === hintedOrganization.id)
  ) {
    await selectOrganization({
      user_id: prev.user.id,
      organization_id: hintedOrganization.id,
    });
    return prev;
  }

  return {
    redirect: `/users/join-organization?siret_hint=${req.session.siretHint}`,
  };
}

export async function requireUserHasSelectedAnOrganization(
  req: Request,
): Promise<GuardResult<{ user: User }>> {
  const prev = await requireUserBelongsToHintedOrganization(req);
  if (!("ok" in prev)) return prev;

  if (!req.session.interactionId) return prev;
  if (!req.session.mustReturnOneOrganizationInPayload) return prev;

  const selectedOrganizationId = await getSelectedOrganizationId(prev.user.id);

  if (selectedOrganizationId) return prev;

  const userOrganisations = await getOrganizationsByUserId(prev.user.id);

  if (
    userOrganisations.length === 1 &&
    !req.session.certificationDirigeantRequested
  ) {
    await selectOrganization({
      user_id: prev.user.id,
      organization_id: userOrganisations[0].id,
    });
    return prev;
  }

  return { redirect: "/users/select-organization" };
}

async function requireSelectedOrganizationToBeFlaggedAsPending(
  req: Request,
): Promise<GuardResult<{ user: User }>> {
  const prev = await requireUserHasSelectedAnOrganization(req);
  if (!("ok" in prev)) return prev;

  if (!req.session.interactionId) return prev;
  if (!req.session.mustReturnOneOrganizationInPayload) return prev;

  if (req.session.certificationDirigeantRequested) {
    const { id: user_id } = prev.user;
    const selectedOrganizationId = (await getSelectedOrganizationId(user_id))!;
    const { verification_type: linkType } = (await getUserOrganizationLink(
      selectedOrganizationId,
      user_id,
    ))!;

    if (
      linkType !== "pending_organization_dirigeant" &&
      linkType !== "organization_dirigeant"
    ) {
      await updateUserOrganizationLink(selectedOrganizationId, user_id, {
        verification_type: "pending_organization_dirigeant",
        verified_at: new Date(),
      });
    }
  }

  return prev;
}

async function requireUserIsFranceConnected(
  req: Request,
): Promise<GuardResult<{ user: User }>> {
  const prev = await requireSelectedOrganizationToBeFlaggedAsPending(req);
  if (!("ok" in prev)) return prev;

  if (!req.session.interactionId) return prev;
  if (!req.session.mustReturnOneOrganizationInPayload) return prev;
  if (FEATURE_CONSIDER_ALL_USERS_AS_CERTIFIED) return prev;

  const { id: user_id } = prev.user;
  const selectedOrganizationId = (await getSelectedOrganizationId(user_id))!;
  const { verification_type: linkType } = (await getUserOrganizationLink(
    selectedOrganizationId,
    user_id,
  ))!;

  if (
    linkType !== "pending_organization_dirigeant" &&
    linkType !== "organization_dirigeant"
  )
    return prev;

  const isVerified = await isUserVerifiedWithFranceconnect(user_id);

  if (isVerified) return prev;

  return { redirect: "/users/certification-dirigeant" };
}

async function requireUserHasPersonalInformations(
  req: Request,
): Promise<GuardResult<{ user: User }>> {
  const prev = await requireUserIsFranceConnected(req);
  if (!("ok" in prev)) return prev;

  if (!req.session.interactionId) return prev;

  const { given_name, family_name } = prev.user;
  if (isEmpty(given_name) || isEmpty(family_name)) {
    return { redirect: "/users/personal-information" };
  }

  return prev;
}

async function requireUserPassedCertificationDirigeant(
  req: Request,
): Promise<GuardResult<{ user: User }>> {
  const prev = await requireUserHasPersonalInformations(req);
  if (!("ok" in prev)) return prev;

  if (!req.session.interactionId) return prev;
  if (!req.session.mustReturnOneOrganizationInPayload) return prev;
  if (FEATURE_CONSIDER_ALL_USERS_AS_CERTIFIED) return prev;

  const { id: user_id } = prev.user;
  const selectedOrganizationId = (await getSelectedOrganizationId(user_id))!;

  const organization = (await getOrganizationById(selectedOrganizationId))!;
  const { verification_type: linkType, verified_at: linkVerifiedAt } =
    (await getUserOrganizationLink(selectedOrganizationId, user_id))!;

  if (
    linkType !== "pending_organization_dirigeant" &&
    linkType !== "organization_dirigeant"
  )
    return prev;

  const franceconnectUserInfo = (await getFranceConnectUserInfo(user_id))!;

  const expiredCertification = isExpired(
    linkVerifiedAt,
    CERTIFICATION_DIRIGEANT_MAX_AGE_IN_MINUTES,
  );
  const expiredVerification =
    Number(franceconnectUserInfo.updated_at) > Number(linkVerifiedAt);

  const renewalNeeded = expiredCertification || expiredVerification;

  if (linkType === "organization_dirigeant" && !renewalNeeded) return prev;

  try {
    await processCertificationDirigeantOrThrow(
      organization,
      franceconnectUserInfo,
      user_id,
    );
  } catch (error) {
    if (error instanceof CertificationDirigeantOrganizationNotCoveredError) {
      return {
        redirect:
          "/users/certification-dirigeant/organization-not-covered-error",
      };
    }

    if (error instanceof CertificationDirigeantCloseMatchError) {
      return {
        redirect: getCertificationDirigeantCloseMatchErrorUrl(error),
      };
    }

    if (error instanceof CertificationDirigeantNoMatchError) {
      return {
        redirect: `/users/certification-dirigeant/no-match-error?siren=${error.siren}`,
      };
    }

    throw error;
  }

  return prev;
}

export async function requireUserHasNoPendingOfficialContactEmailVerification(
  req: Request,
): Promise<GuardResult<{ user: User }>> {
  const prev = await requireUserPassedCertificationDirigeant(req);
  if (!("ok" in prev)) return prev;

  const userOrganisations = await getOrganizationsByUserId(prev.user.id);

  let organizationThatNeedsOfficialContactEmailVerification;
  if (req.session.mustReturnOneOrganizationInPayload) {
    const selectedOrganizationId = await getSelectedOrganizationId(
      prev.user.id,
    );

    organizationThatNeedsOfficialContactEmailVerification =
      userOrganisations.find(
        ({ id, needs_official_contact_email_verification }) =>
          needs_official_contact_email_verification &&
          id === selectedOrganizationId,
      );
  } else {
    organizationThatNeedsOfficialContactEmailVerification =
      userOrganisations.find(
        ({ needs_official_contact_email_verification }) =>
          needs_official_contact_email_verification,
      );
  }

  if (!isEmpty(organizationThatNeedsOfficialContactEmailVerification)) {
    return {
      redirect: `/users/official-contact-email-verification/${organizationThatNeedsOfficialContactEmailVerification.id}`,
    };
  }

  return prev;
}

export async function requireUserHasBeenGreetedForJoiningOrganization(
  req: Request,
): Promise<GuardResult<{ user: User }>> {
  const prev =
    await requireUserHasNoPendingOfficialContactEmailVerification(req);
  if (!("ok" in prev)) return prev;

  const userOrganisations = await getOrganizationsByUserId(prev.user.id);

  let organizationThatNeedsGreetings;

  if (req.session.mustReturnOneOrganizationInPayload) {
    const selectedOrganizationId = await getSelectedOrganizationId(
      prev.user.id,
    );

    organizationThatNeedsGreetings = userOrganisations.find(
      ({ id, has_been_greeted }) =>
        !has_been_greeted && id === selectedOrganizationId,
    );
  } else {
    organizationThatNeedsGreetings = userOrganisations.find(
      ({ has_been_greeted }) => !has_been_greeted,
    );
  }

  if (!isEmpty(organizationThatNeedsGreetings)) {
    if (
      organizationThatNeedsGreetings.verification_type ===
      "organization_dirigeant"
    ) {
      await greetForCertification({
        user_id: prev.user.id,
        organization_id: organizationThatNeedsGreetings.id,
      });
      return { redirect: `/users/welcome/dirigeant` };
    }

    await greetForJoiningOrganization({
      user_id: prev.user.id,
      organization_id: organizationThatNeedsGreetings.id,
    });

    return { redirect: `/users/welcome` };
  }

  return prev;
}

// check that the user goes through all requirements before issuing a session
export const requireUserSignInRequirements =
  requireUserHasBeenGreetedForJoiningOrganization;
