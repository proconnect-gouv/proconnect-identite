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

export type Redirect = { redirect: string };
export type Send = { send: true };
export type Pass<T> = { ok: true } & T;
export type GuardResult<T> = Pass<T> | Redirect | Send;

const is_ok = <T>(result: GuardResult<T>): result is Pass<T> => "ok" in result;

export type InteractionContext = {
  certificationDirigeantRequested: boolean | undefined;
  interactionId: string;
  mustReturnOneOrganizationInPayload: boolean;
  siretHint: string | undefined;
};

/**
 * Extract interaction context from session.
 * Returns undefined if not in an OIDC interaction flow.
 */
function getInteractionContext(req: Request): InteractionContext | undefined {
  if (!req.session.interactionId) return undefined;

  return {
    certificationDirigeantRequested:
      req.session.certificationDirigeantRequested,
    interactionId: req.session.interactionId,
    mustReturnOneOrganizationInPayload:
      req.session.mustReturnOneOrganizationInPayload ?? false,
    siretHint: req.session.siretHint,
  };
}

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

/**
 * Middleware wrapper for requireUserHasSelectedAnOrganization.
 * Used on routes that require org selection (part of OIDC flow).
 */
async function requireUserHasSelectedAnOrganizationMiddleware(req: Request) {
  const prev = await requireUserHasAtLeastOneOrganization(req);
  if (!is_ok(prev)) return prev;

  const { user, interaction } = prev;

  if (!interaction?.mustReturnOneOrganizationInPayload) {
    // Outside OIDC flow or no org required - just pass through
    return prev;
  }

  const result = await requireUserBelongsToHintedOrganization(
    user,
    interaction,
  );
  if (!is_ok(result)) return result;

  return requireUserHasSelectedAnOrganization(
    user,
    interaction.certificationDirigeantRequested,
  );
}

export const guard = {
  admin: middleware(requireUserTwoFactorAuthForAdmin),
  browserTrusted: middleware(requireBrowserIsTrusted),
  connected: middleware(requireUserIsConnected),
  connectedRecently: middleware(requireUserHasConnectedRecently),
  credentialPromptReady: middleware(requireCredentialPromptRequirements),
  emailInSession: middleware(requireEmailInSession),
  hasAtLeastOneOrganization: middleware(requireUserHasAtLeastOneOrganization),
  hasSelectedAnOrganization: middleware(
    requireUserHasSelectedAnOrganizationMiddleware,
  ),
  isUser: middleware(requireIsUser),
  loggedInRecently: middleware(requireUserHasLoggedInRecently),
  signInRequirements: middleware(requireSignInRequirements),
  verified: middleware(requireUserIsVerified),
};

export async function requireEmailInSession(
  req: Request,
): Promise<GuardResult<{ email: string }>> {
  const prev = await requireIsUser(req);
  if (!is_ok(prev)) return prev;

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
  if (!is_ok(prev)) return prev;

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
  if (!is_ok(prev)) return prev;

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
  if (!is_ok(prev)) return prev;

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
  if (!is_ok(prev)) return prev;

  const { email, email_verified } = prev.user;
  const needs_email_verification_renewal =
    await needsEmailVerificationRenewal(email);

  if (!email_verified || needs_email_verification_renewal) {
    const notification_param =
      email_verified && needs_email_verification_renewal
        ? "?notification=email_verification_renewal"
        : "";
    return { redirect: `/users/verify-email${notification_param}` };
  }

  return prev;
}

async function requireUserTwoFactorAuth(
  req: Request,
): Promise<GuardResult<{ user: User }>> {
  const prev = await requireUserIsVerified(req);
  if (!is_ok(prev)) return prev;

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
  if (!is_ok(prev)) return prev;

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
  if (!is_ok(prev)) return prev;

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
  if (!is_ok(prev)) return prev;

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
): Promise<
  GuardResult<{ user: User; interaction: InteractionContext | undefined }>
> {
  const prev = await requireBrowserIsTrusted(req);
  if (!is_ok(prev)) return prev;

  const interaction = getInteractionContext(req);

  // Outside OIDC flow - don't require organizations
  if (!interaction) return { ...prev, interaction };

  if (isEmpty(await getOrganizationsByUserId(prev.user.id))) {
    return {
      redirect: addQueryParameters("/users/join-organization", {
        siret_hint: interaction.siretHint,
      }),
    };
  }

  return { ...prev, interaction };
}

async function requireUserBelongsToHintedOrganization(
  user: User,
  interaction: InteractionContext,
): Promise<GuardResult<{ user: User }>> {
  if (!interaction.siretHint) {
    return { ok: true, user };
  }

  const hintedOrganization = await getOrganizationBySiret(
    interaction.siretHint,
  );
  const userOrganisations = await getOrganizationsByUserId(user.id);

  if (
    !isEmpty(hintedOrganization) &&
    userOrganisations.some((org) => org.id === hintedOrganization.id)
  ) {
    await selectOrganization({
      organization_id: hintedOrganization.id,
      user_id: user.id,
    });
    return { ok: true, user };
  }

  return {
    redirect: `/users/join-organization?siret_hint=${interaction.siretHint}`,
  };
}

async function requireUserHasSelectedAnOrganization(
  user: User,
  certificationDirigeantRequested: boolean | undefined,
): Promise<GuardResult<{ user: User }>> {
  const selectedOrganizationId = await getSelectedOrganizationId(user.id);

  if (selectedOrganizationId) {
    return { ok: true, user };
  }

  const userOrganisations = await getOrganizationsByUserId(user.id);

  if (userOrganisations.length === 1 && !certificationDirigeantRequested) {
    await selectOrganization({
      organization_id: userOrganisations[0].id,
      user_id: user.id,
    });
    return { ok: true, user };
  }

  return { redirect: "/users/select-organization" };
}

async function requireSelectedOrganizationToBeFlaggedAsPending(
  user: User,
  certificationDirigeantRequested: boolean | undefined,
): Promise<GuardResult<{ user: User }>> {
  if (certificationDirigeantRequested) {
    const selectedOrganizationId = (await getSelectedOrganizationId(user.id))!;
    const { verification_type: linkType } = (await getUserOrganizationLink(
      selectedOrganizationId,
      user.id,
    ))!;

    if (
      linkType !== "pending_organization_dirigeant" &&
      linkType !== "organization_dirigeant"
    ) {
      await updateUserOrganizationLink(selectedOrganizationId, user.id, {
        verification_type: "pending_organization_dirigeant",
        verified_at: new Date(),
      });
    }
  }

  return { ok: true, user };
}

async function requireUserIsFranceConnected(
  user: User,
): Promise<GuardResult<{ user: User }>> {
  if (FEATURE_CONSIDER_ALL_USERS_AS_CERTIFIED) {
    return { ok: true, user };
  }

  const selectedOrganizationId = (await getSelectedOrganizationId(user.id))!;
  const { verification_type: linkType } = (await getUserOrganizationLink(
    selectedOrganizationId,
    user.id,
  ))!;

  if (
    linkType !== "pending_organization_dirigeant" &&
    linkType !== "organization_dirigeant"
  ) {
    return { ok: true, user };
  }

  const isVerified = await isUserVerifiedWithFranceconnect(user.id);

  if (isVerified) {
    return { ok: true, user };
  }

  return { redirect: "/users/certification-dirigeant" };
}

async function requireUserHasPersonalInformations(
  user: User,
): Promise<GuardResult<{ user: User }>> {
  const { family_name, given_name } = user;
  if (isEmpty(given_name) || isEmpty(family_name)) {
    return { redirect: "/users/personal-information" };
  }

  return { ok: true, user };
}

async function requireUserPassedCertificationDirigeant(
  user: User,
): Promise<GuardResult<{ user: User }>> {
  if (FEATURE_CONSIDER_ALL_USERS_AS_CERTIFIED) {
    return { ok: true, user };
  }

  const selectedOrganizationId = (await getSelectedOrganizationId(user.id))!;

  const organization = (await getOrganizationById(selectedOrganizationId))!;
  const { verification_type: linkType, verified_at: linkVerifiedAt } =
    (await getUserOrganizationLink(selectedOrganizationId, user.id))!;

  if (
    linkType !== "pending_organization_dirigeant" &&
    linkType !== "organization_dirigeant"
  ) {
    return { ok: true, user };
  }

  const franceconnectUserInfo = (await getFranceConnectUserInfo(user.id))!;

  const expiredCertification = isExpired(
    linkVerifiedAt,
    CERTIFICATION_DIRIGEANT_MAX_AGE_IN_MINUTES,
  );
  const expiredVerification =
    Number(franceconnectUserInfo.updated_at) > Number(linkVerifiedAt);

  const renewalNeeded = expiredCertification || expiredVerification;

  if (linkType === "organization_dirigeant" && !renewalNeeded) {
    return { ok: true, user };
  }

  try {
    await processCertificationDirigeantOrThrow(
      organization,
      franceconnectUserInfo,
      user.id,
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

  return { ok: true, user };
}

async function requireUserHasNoPendingOfficialContactEmailVerification(
  user: User,
  selectedOrganizationId: number | undefined,
): Promise<GuardResult<{ user: User }>> {
  const userOrganisations = await getOrganizationsByUserId(user.id);

  const organizationThatNeedsOfficialContactEmailVerification =
    selectedOrganizationId
      ? userOrganisations.find(
          ({ id, needs_official_contact_email_verification }) =>
            needs_official_contact_email_verification &&
            id === selectedOrganizationId,
        )
      : userOrganisations.find(
          ({ needs_official_contact_email_verification }) =>
            needs_official_contact_email_verification,
        );

  if (!isEmpty(organizationThatNeedsOfficialContactEmailVerification)) {
    return {
      redirect: `/users/official-contact-email-verification/${organizationThatNeedsOfficialContactEmailVerification.id}`,
    };
  }

  return { ok: true, user };
}

async function requireUserHasBeenGreetedForJoiningOrganization(
  user: User,
  selectedOrganizationId: number | undefined,
): Promise<GuardResult<{ user: User }>> {
  const userOrganisations = await getOrganizationsByUserId(user.id);

  const organizationThatNeedsGreetings = selectedOrganizationId
    ? userOrganisations.find(
        ({ has_been_greeted, id }) =>
          !has_been_greeted && id === selectedOrganizationId,
      )
    : userOrganisations.find(({ has_been_greeted }) => !has_been_greeted);

  if (!isEmpty(organizationThatNeedsGreetings)) {
    if (
      organizationThatNeedsGreetings.verification_type ===
      "organization_dirigeant"
    ) {
      await greetForCertification({
        organization_id: organizationThatNeedsGreetings.id,
        user_id: user.id,
      });
      return { redirect: `/users/welcome/dirigeant` };
    }

    await greetForJoiningOrganization({
      organization_id: organizationThatNeedsGreetings.id,
      user_id: user.id,
    });

    return { redirect: `/users/welcome` };
  }

  return { ok: true, user };
}

/**
 * Branching guards that run in both interaction and non-interaction flows.
 * The selectedOrganizationId scopes the checks:
 * - undefined = check all user organizations
 * - number = check only the selected organization
 */
async function requireBranchingGuards(
  user: User,
  selectedOrganizationId: number | undefined,
): Promise<GuardResult<{ user: User }>> {
  let result = await requireUserHasNoPendingOfficialContactEmailVerification(
    user,
    selectedOrganizationId,
  );
  if (!is_ok(result)) return result;

  return requireUserHasBeenGreetedForJoiningOrganization(
    user,
    selectedOrganizationId,
  );
}

/**
 * Organization selection chain - runs when mustReturnOneOrganizationInPayload is true.
 * Handles org selection, dirigeant certification, and FranceConnect verification.
 */
async function requireOrganizationSelectionChain(
  user: User,
  certificationDirigeantRequested: boolean | undefined,
): Promise<GuardResult<{ user: User }>> {
  let result = await requireUserHasSelectedAnOrganization(
    user,
    certificationDirigeantRequested,
  );
  if (!is_ok(result)) return result;

  result = await requireSelectedOrganizationToBeFlaggedAsPending(
    user,
    certificationDirigeantRequested,
  );
  if (!is_ok(result)) return result;

  result = await requireUserIsFranceConnected(user);
  if (!is_ok(result)) return result;

  result = await requireUserHasPersonalInformations(user);
  if (!is_ok(result)) return result;

  result = await requireUserPassedCertificationDirigeant(user);
  if (!is_ok(result)) return result;

  // Get selected org for scoped branching guards
  const selectedOrganizationId = await getSelectedOrganizationId(user.id);

  return requireBranchingGuards(user, selectedOrganizationId ?? undefined);
}

/**
 * Interaction-only chain that runs the full organization verification flow.
 * Forks based on mustReturnOneOrganizationInPayload.
 */
async function requireInteractionChain(
  user: User,
  interaction: InteractionContext,
): Promise<GuardResult<{ user: User }>> {
  let result = await requireUserBelongsToHintedOrganization(user, interaction);
  if (!is_ok(result)) return result;

  if (interaction.mustReturnOneOrganizationInPayload) {
    // Full org selection and certification chain
    return requireOrganizationSelectionChain(
      user,
      interaction.certificationDirigeantRequested,
    );
  } else {
    // No org selection required - check personal info then run branching guards
    result = await requireUserHasPersonalInformations(user);
    if (!is_ok(result)) return result;

    return requireBranchingGuards(user, undefined);
  }
}

/**
 * Main entry point for sign-in requirements.
 * Forks once based on interaction presence.
 */
async function requireSignInRequirements(
  req: Request,
): Promise<GuardResult<{ user: User }>> {
  const prev = await requireUserHasAtLeastOneOrganization(req);
  if (!is_ok(prev)) return prev;

  const { user, interaction } = prev;

  if (interaction) {
    // Full interaction chain with organization verification
    return requireInteractionChain(user, interaction);
  } else {
    // Non-interaction: skip org verification, run branching guards only
    return requireBranchingGuards(user, undefined);
  }
}

// check that the user goes through all requirements before issuing a session
export const requireUserSignInRequirements = requireSignInRequirements;
