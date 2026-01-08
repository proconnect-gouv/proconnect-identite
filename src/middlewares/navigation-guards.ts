import { getTrustedReferrerPath } from "@proconnect-gouv/proconnect.core/security";
import { InvalidCertificationError } from "@proconnect-gouv/proconnect.identite/errors";
import type { User } from "@proconnect-gouv/proconnect.identite/types";
import { captureException } from "@sentry/node";
import type { Request, RequestHandler } from "express";
import HttpErrors from "http-errors";
import { isEmpty } from "lodash-es";
import assert, { AssertionError } from "node:assert/strict";
import {
  CERTIFICATION_DIRIGEANT_MAX_AGE_IN_MINUTES,
  FEATURE_CONSIDER_ALL_USERS_AS_CERTIFIED,
  HOST,
} from "../config/env";
import { is2FACapable, shouldForce2faForUser } from "../managers/2fa";
import { isBrowserTrustedForUser } from "../managers/browser-authentication";
import { performCertificationDirigeant } from "../managers/certification";
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
import { CertificationSessionSchema } from "../managers/session/certification";
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
import { findById, getFranceConnectUserInfo } from "../repositories/user";
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

export type GuardResult =
  | { type: "next" }
  | { type: "redirect"; url: string }
  | { type: "send" };

const load_context = async (req: Request) => {
  const is_within_authenticated_session = isWithinAuthenticatedSession(
    req.session,
  );

  let user: User | undefined;
  if (is_within_authenticated_session) {
    const sessionUser = getUserFromAuthenticatedSession(req);
    user = await findById(sessionUser.id);
  }

  const organizations = user ? await getOrganizationsByUserId(user.id) : [];

  return {
    uses_auth_headers: usesAuthHeaders(req),
    is_within_authenticated_session,
    organizations,
    user,
  };
};
export type GuardContext = Awaited<ReturnType<typeof load_context>> & {
  req: Request;
};
type Guard = (context: GuardContext) => GuardResult | Promise<GuardResult>;

export type NavigationGuardNode = {
  previous?: NavigationGuardNode;
  guard: Guard;
};

type ExpressGuardBuilder = (guard: Guard) => RequestHandler;
const defaultExpressGuardBuilder: ExpressGuardBuilder =
  (guard) => async (req, res, next) => {
    const context = await load_context(req);
    const result = await guard({ req, ...context });

    switch (result.type) {
      case "next":
        return next();
      case "redirect":
        return res.redirect(result.url);
      case "send":
        return res.send();
    }
  };
export const navigationGuardChain = (
  node: NavigationGuardNode,
  expressGuard = defaultExpressGuardBuilder,
): RequestHandler[] => {
  if (!node.previous) return [expressGuard(node.guard)];

  return [...navigationGuardChain(node.previous), expressGuard(node.guard)];
};

export const requireIsUser: NavigationGuardNode = {
  guard: ({ uses_auth_headers }) => {
    if (uses_auth_headers) {
      throw new HttpErrors.Forbidden(
        "Access denied. The requested resource does not require authentication.",
      );
    }

    return { type: "next" };
  },
};

// redirect user to start sign-in page if no email is available in session
export const requireEmailInSession: NavigationGuardNode = {
  previous: requireIsUser,
  guard: ({ req }) => {
    if (isEmpty(getEmailFromUnauthenticatedSession(req))) {
      return { type: "redirect", url: `/users/start-sign-in` };
    }

    return { type: "next" };
  },
};

// redirect user to inclusionconnect welcome page if needed
export const requireUserHasSeenInclusionconnectWelcomePage: NavigationGuardNode =
  {
    previous: requireEmailInSession,
    guard: ({ req }) => {
      if (
        getPartialUserFromUnauthenticatedSession(req)
          .needsInclusionconnectWelcomePage
      ) {
        return { type: "redirect", url: `/users/inclusionconnect-welcome` };
      }

      return { type: "next" };
    },
  };

export const requireCredentialPromptRequirements =
  requireUserHasSeenInclusionconnectWelcomePage;

// redirect user to login page if no active session is available
export const requireUserIsConnected: NavigationGuardNode = {
  previous: requireIsUser,
  guard: ({ req }) => {
    if (req.method === "HEAD") {
      // From express documentation:
      // The app.get() function is automatically called for the HTTP HEAD method
      // in addition to the GET method if app.head() was not called for the path
      // before app.get().
      // We return empty response and the headers are sent to the client.
      return { type: "send" };
    }

    if (!isWithinAuthenticatedSession(req.session)) {
      const referrerPath = getReferrerPath(req);
      if (referrerPath) {
        req.session.referrerPath = referrerPath;
      }

      return { type: "redirect", url: `/users/start-sign-in` };
    }

    return { type: "next" };
  },
};

export const requireUserHasConnectedRecently: NavigationGuardNode = {
  previous: requireUserIsConnected,
  guard: ({ req }) => {
    const hasLoggedInRecently = hasUserAuthenticatedRecently(req);

    if (!hasLoggedInRecently) {
      req.session.referrerPath = getReferrerPath(req);

      return {
        type: "redirect",
        url: `/users/start-sign-in?notification=login_required`,
      };
    }

    return { type: "next" };
  },
};

export const requireUserIsVerified: NavigationGuardNode = {
  previous: requireUserIsConnected,
  guard: async ({ user }) => {
    assert.ok(user);

    const { email, email_verified } = user;

    const needs_email_verification_renewal =
      await needsEmailVerificationRenewal(email);

    if (!email_verified || needs_email_verification_renewal) {
      let notification_param = "";

      if (!email_verified) {
        notification_param = "";
      } else if (needs_email_verification_renewal) {
        notification_param = "?notification=email_verification_renewal";
      }

      return {
        type: "redirect",
        url: `/users/verify-email${notification_param}`,
      };
    }

    return { type: "next" };
  },
};

const requireUserTwoFactorAuth: NavigationGuardNode = {
  previous: requireUserIsVerified,
  guard: async ({ req, user }) => {
    assert.ok(user);

    const { id: user_id } = user;

    if (
      ((await shouldForce2faForUser(user_id)) ||
        req.session.twoFactorsAuthRequested) &&
      !isWithinTwoFactorAuthenticatedSession(req)
    ) {
      if (await is2FACapable(user_id)) {
        return { type: "redirect", url: "/users/2fa-sign-in" };
      } else {
        return { type: "redirect", url: "/users/double-authentication-choice" };
      }
    }
    return { type: "next" };
  },
};

export const requireBrowserIsTrusted: NavigationGuardNode = {
  previous: requireUserTwoFactorAuth,
  guard: ({ req }) => {
    const is_browser_trusted = isBrowserTrustedForUser(req);

    if (!is_browser_trusted) {
      return {
        type: "redirect",
        url: `/users/verify-email?notification=browser_not_trusted`,
      };
    }

    return { type: "next" };
  },
};

export const requireUserIsFranceConnected: NavigationGuardNode = {
  previous: requireBrowserIsTrusted,
  guard: async ({ req, user }) => {
    assert.ok(user);

    if (FEATURE_CONSIDER_ALL_USERS_AS_CERTIFIED) return { type: "next" };

    const { certificationDirigeantRequested: isRequested } =
      await CertificationSessionSchema.parseAsync(req.session);
    if (!isRequested) return { type: "next" };

    const { id: userId } = user;
    const isVerified = await isUserVerifiedWithFranceconnect(userId);

    if (isVerified) return { type: "next" };

    return { type: "redirect", url: "/users/certification-dirigeant" };
  },
};

export const requireUserHasPersonalInformations: NavigationGuardNode = {
  previous: requireUserIsFranceConnected,
  guard: ({ user }) => {
    assert.ok(user);

    const { given_name, family_name } = user;
    if (isEmpty(given_name) || isEmpty(family_name)) {
      return { type: "redirect", url: "/users/personal-information" };
    }

    return { type: "next" };
  },
};

export const requireUserHasAtLeastOneOrganization: NavigationGuardNode = {
  previous: requireUserHasPersonalInformations,
  guard: async ({ req, user }) => {
    assert.ok(user);

    if (isEmpty(await getOrganizationsByUserId(user.id))) {
      return {
        type: "redirect",
        url: addQueryParameters("/users/join-organization", {
          siret_hint: req.session.siretHint,
        }),
      };
    }

    return { type: "next" };
  },
};

export const requireUserCanAccessApp = requireUserHasAtLeastOneOrganization;

export const requireUserHasLoggedInRecently: NavigationGuardNode = {
  previous: requireUserCanAccessApp,
  guard: ({ req, user }) => {
    assert.ok(user);

    const hasLoggedInRecently = hasUserAuthenticatedRecently(req);

    if (!hasLoggedInRecently) {
      req.session.referrerPath = getReferrerPath(req);

      return {
        type: "redirect",
        url: `/users/start-sign-in?notification=login_required`,
      };
    }

    return { type: "next" };
  },
};

export const requireUserTwoFactorAuthForAdmin: NavigationGuardNode = {
  previous: requireUserHasLoggedInRecently,
  guard: async ({ req, user }) => {
    assert.ok(user);

    const { id: user_id } = user;

    if (
      (await is2FACapable(user_id)) &&
      !isWithinTwoFactorAuthenticatedSession(req)
    ) {
      req.session.referrerPath = getReferrerPath(req);

      return {
        type: "redirect",
        url: "/users/2fa-sign-in?notification=2fa_required",
      };
    }

    return { type: "next" };
  },
};

export const requireUserCanAccessAdmin = requireUserTwoFactorAuthForAdmin;

const requireUserBelongsToHintedOrganization: NavigationGuardNode = {
  previous: requireUserHasAtLeastOneOrganization,
  guard: async ({ req, user }) => {
    assert.ok(user);

    if (!req.session.siretHint) {
      return { type: "next" };
    }
    const hintedOrganization = await getOrganizationBySiret(
      req.session.siretHint,
    );

    const userFromAuthenticatedSession = user;

    const organizations = await getOrganizationsByUserId(
      userFromAuthenticatedSession.id,
    );

    if (
      !isEmpty(hintedOrganization) &&
      organizations.some((org) => org.id === hintedOrganization.id)
    ) {
      await selectOrganization({
        user_id: userFromAuthenticatedSession.id,
        organization_id: hintedOrganization.id,
      });
      return { type: "next" };
    } else {
      return {
        type: "redirect",
        url: `/users/join-organization?siret_hint=${req.session.siretHint}`,
      };
    }
  },
};

export const requireUserHasSelectedAnOrganization: NavigationGuardNode = {
  previous: requireUserBelongsToHintedOrganization,
  guard: async ({ req, user }) => {
    assert.ok(user);

    if (!req.session.mustReturnOneOrganizationInPayload)
      return { type: "next" };

    const selectedOrganizationId = await getSelectedOrganizationId(user.id);

    if (selectedOrganizationId) {
      return { type: "next" };
    }

    const organizations = await getOrganizationsByUserId(user.id);

    if (
      organizations.length === 1 &&
      !req.session.certificationDirigeantRequested
    ) {
      await selectOrganization({
        user_id: user.id,
        organization_id: organizations[0].id,
      });
      return { type: "next" };
    }

    return { type: "redirect", url: "/users/select-organization" };
  },
};

export const requireUserPassedCertificationDirigeant: NavigationGuardNode = {
  previous: requireUserHasSelectedAnOrganization,
  guard: async ({ req, user }) => {
    assert.ok(user);

    if (!req.session.mustReturnOneOrganizationInPayload)
      return { type: "next" };

    if (FEATURE_CONSIDER_ALL_USERS_AS_CERTIFIED) return { type: "next" };
    if (!req.session.certificationDirigeantRequested) return { type: "next" };

    const { id: user_id } = user;
    const selectedOrganizationId = (await getSelectedOrganizationId(user_id))!;

    const organization = (await getOrganizationById(selectedOrganizationId))!;
    const userOrganizationLink = (await getUserOrganizationLink(
      selectedOrganizationId,
      user_id,
    ))!;

    const franceconnectUserInfo = (await getFranceConnectUserInfo(user_id))!;

    const expiredCertification = isExpired(
      userOrganizationLink.verified_at,
      CERTIFICATION_DIRIGEANT_MAX_AGE_IN_MINUTES,
    );
    const expiredVerification =
      Number(franceconnectUserInfo.updated_at) >
      Number(userOrganizationLink.verified_at);

    const renewalNeeded = expiredCertification || expiredVerification;

    if (
      userOrganizationLink.verification_type === "organization_dirigeant" &&
      !renewalNeeded
    ) {
      return { type: "next" };
    }

    const { cause, details, ok } = await performCertificationDirigeant(
      organization,
      user_id,
    );

    if (!ok) {
      const matches = cause === "close_match" ? details.matches : undefined;
      captureException(
        new InvalidCertificationError(matches, cause, {
          cause: new AssertionError({
            expected: 0,
            actual: details.matches.size,
            operator: "isOrganizationDirigeant",
          }),
        }),
      );

      return matches
        ? {
            type: "redirect",
            url:
              "/users/unable-to-certify-user-as-executive?matches=" +
              [...matches].join(","),
          }
        : {
            type: "redirect",
            url: "/users/unable-to-certify-user-as-executive",
          };
    }

    // user is already in the organization
    // we override the previous verification_type
    await updateUserOrganizationLink(
      userOrganizationLink.organization_id,
      userOrganizationLink.user_id,
      {
        verification_type: "organization_dirigeant",
        verified_at: new Date(),
        has_been_greeted: false,
      },
    );

    return { type: "next" };
  },
};

export const requireUserHasNoPendingOfficialContactEmailVerification: NavigationGuardNode =
  {
    previous: requireUserPassedCertificationDirigeant,
    guard: async ({ req, organizations, user }) => {
      assert.ok(user);

      let organizationThatNeedsOfficialContactEmailVerification;
      if (req.session.mustReturnOneOrganizationInPayload) {
        const selectedOrganizationId = await getSelectedOrganizationId(user.id);

        organizationThatNeedsOfficialContactEmailVerification =
          organizations.find(
            ({ id, needs_official_contact_email_verification }) =>
              needs_official_contact_email_verification &&
              id === selectedOrganizationId,
          );
      } else {
        organizationThatNeedsOfficialContactEmailVerification =
          organizations.find(
            ({ needs_official_contact_email_verification }) =>
              needs_official_contact_email_verification,
          );
      }

      if (!isEmpty(organizationThatNeedsOfficialContactEmailVerification)) {
        return {
          type: "redirect",
          url: `/users/official-contact-email-verification/${organizationThatNeedsOfficialContactEmailVerification.id}`,
        };
      }

      return { type: "next" };
    },
  };

export const requireUserHasBeenGreetedForJoiningOrganization: NavigationGuardNode =
  {
    previous: requireUserHasNoPendingOfficialContactEmailVerification,
    guard: async ({ req, organizations, user }) => {
      assert.ok(user);
      let organizationThatNeedsGreetings;

      if (req.session.mustReturnOneOrganizationInPayload) {
        const selectedOrganizationId = await getSelectedOrganizationId(user.id);

        organizationThatNeedsGreetings = organizations.find(
          ({ id, has_been_greeted }) =>
            !has_been_greeted && id === selectedOrganizationId,
        );
      } else {
        organizationThatNeedsGreetings = organizations.find(
          ({ has_been_greeted }) => !has_been_greeted,
        );
      }

      if (!isEmpty(organizationThatNeedsGreetings)) {
        if (
          organizationThatNeedsGreetings.verification_type ===
          "organization_dirigeant"
        ) {
          await greetForCertification({
            user_id: user.id,
            organization_id: organizationThatNeedsGreetings.id,
          });
          return { type: "redirect", url: `/users/welcome/dirigeant` };
        }

        await greetForJoiningOrganization({
          user_id: user.id,
          organization_id: organizationThatNeedsGreetings.id,
        });

        return { type: "redirect", url: `/users/welcome` };
      }

      return { type: "next" };
    },
  };

// check that the user goes through all requirements before issuing a session
export const requireUserSignInRequirements =
  requireUserHasBeenGreetedForJoiningOrganization;
