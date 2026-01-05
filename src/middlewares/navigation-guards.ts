import { getTrustedReferrerPath } from "@proconnect-gouv/proconnect.core/security";
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

type GuardResult =
  | { type: "next" }
  | { type: "redirect"; url: string }
  | { type: "send" };

type Guard = (req: Request) => GuardResult | Promise<GuardResult>;

type NavigationGuardNode = {
  previous?: NavigationGuardNode;
  guard: Guard;
};

export const navigationGuardChain = (
  node: NavigationGuardNode,
): RequestHandler[] => {
  const expressGuard: RequestHandler = async (req, res, next) => {
    const result = await node.guard(req);

    switch (result.type) {
      case "next":
        return next();
      case "redirect":
        return res.redirect(result.url);
      case "send":
        return res.send();
    }
  };

  if (!node.previous) return [expressGuard];

  return [...navigationGuardChain(node.previous), expressGuard];
};

export const requireIsUser: NavigationGuardNode = {
  guard: (req) => {
    if (usesAuthHeaders(req)) {
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
  guard: (req) => {
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
    guard: (req) => {
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
  guard: (req) => {
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
  guard: (req) => {
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
  guard: async (req) => {
    const { email, email_verified } = getUserFromAuthenticatedSession(req);

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

export const requireUserTwoFactorAuth: NavigationGuardNode = {
  previous: requireUserIsVerified,
  guard: async (req) => {
    const { id: user_id } = getUserFromAuthenticatedSession(req);

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
  guard: (req) => {
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

export const requireUserCanAccessApp = requireBrowserIsTrusted;

export const requireUserHasLoggedInRecently: NavigationGuardNode = {
  previous: requireUserCanAccessApp,
  guard: (req) => {
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
  guard: async (req) => {
    const { id: user_id } = getUserFromAuthenticatedSession(req);

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

export const requireUserHasAtLeastOneOrganization: NavigationGuardNode = {
  previous: requireBrowserIsTrusted,
  guard: async (req) => {
    if (!req.session.interactionId) return { type: "next" };
    if (
      isEmpty(
        await getOrganizationsByUserId(getUserFromAuthenticatedSession(req).id),
      )
    ) {
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

const requireUserBelongsToHintedOrganization: NavigationGuardNode = {
  previous: requireUserHasAtLeastOneOrganization,
  guard: async (req) => {
    if (!req.session.interactionId) return { type: "next" };
    if (!req.session.siretHint) {
      return { type: "next" };
    }
    const hintedOrganization = await getOrganizationBySiret(
      req.session.siretHint,
    );

    const userFromAuthenticatedSession = getUserFromAuthenticatedSession(req);

    const userOrganisations = await getOrganizationsByUserId(
      userFromAuthenticatedSession.id,
    );

    if (
      !isEmpty(hintedOrganization) &&
      userOrganisations.some((org) => org.id === hintedOrganization.id)
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
  guard: async (req) => {
    if (!req.session.interactionId) return { type: "next" };
    if (!req.session.mustReturnOneOrganizationInPayload)
      return { type: "next" };

    const selectedOrganizationId = await getSelectedOrganizationId(
      getUserFromAuthenticatedSession(req).id,
    );

    if (selectedOrganizationId) {
      return { type: "next" };
    }

    const userOrganisations = await getOrganizationsByUserId(
      getUserFromAuthenticatedSession(req).id,
    );

    if (
      userOrganisations.length === 1 &&
      !req.session.certificationDirigeantRequested
    ) {
      await selectOrganization({
        user_id: getUserFromAuthenticatedSession(req).id,
        organization_id: userOrganisations[0].id,
      });
      return { type: "next" };
    }

    return { type: "redirect", url: "/users/select-organization" };
  },
};

const requireSelectedOrganizationToBeFlaggedAsPending: NavigationGuardNode = {
  previous: requireUserHasSelectedAnOrganization,
  guard: async (req) => {
    if (!req.session.interactionId) return { type: "next" };
    if (!req.session.mustReturnOneOrganizationInPayload)
      return { type: "next" };

    if (req.session.certificationDirigeantRequested) {
      const { id: user_id } = getUserFromAuthenticatedSession(req);
      const selectedOrganizationId =
        (await getSelectedOrganizationId(user_id))!;
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

    return { type: "next" };
  },
};
const requireUserIsFranceConnected: NavigationGuardNode = {
  previous: requireSelectedOrganizationToBeFlaggedAsPending,
  guard: async (req) => {
    if (!req.session.interactionId) return { type: "next" };
    if (!req.session.mustReturnOneOrganizationInPayload)
      return { type: "next" };
    if (FEATURE_CONSIDER_ALL_USERS_AS_CERTIFIED) return { type: "next" };

    const { id: user_id } = getUserFromAuthenticatedSession(req);
    const selectedOrganizationId = (await getSelectedOrganizationId(user_id))!;
    const { verification_type: linkType } = (await getUserOrganizationLink(
      selectedOrganizationId,
      user_id,
    ))!;

    if (
      linkType !== "pending_organization_dirigeant" &&
      linkType !== "organization_dirigeant"
    )
      return { type: "next" };

    const { id: userId } = getUserFromAuthenticatedSession(req);
    const isVerified = await isUserVerifiedWithFranceconnect(userId);

    if (isVerified) return { type: "next" };

    return { type: "redirect", url: "/users/certification-dirigeant" };
  },
};

const requireUserHasPersonalInformations: NavigationGuardNode = {
  previous: requireUserIsFranceConnected,
  guard: (req) => {
    if (!req.session.interactionId) return { type: "next" };
    const { given_name, family_name } = getUserFromAuthenticatedSession(req);
    if (isEmpty(given_name) || isEmpty(family_name)) {
      return { type: "redirect", url: "/users/personal-information" };
    }

    return { type: "next" };
  },
};

const requireUserPassedCertificationDirigeant: NavigationGuardNode = {
  previous: requireUserHasPersonalInformations,
  guard: async (req) => {
    if (!req.session.interactionId) return { type: "next" };
    if (!req.session.mustReturnOneOrganizationInPayload)
      return { type: "next" };
    if (FEATURE_CONSIDER_ALL_USERS_AS_CERTIFIED) return { type: "next" };

    const { id: user_id } = getUserFromAuthenticatedSession(req);
    const selectedOrganizationId = (await getSelectedOrganizationId(user_id))!;

    const organization = (await getOrganizationById(selectedOrganizationId))!;
    const { verification_type: linkType, verified_at: linkVerifiedAt } =
      (await getUserOrganizationLink(selectedOrganizationId, user_id))!;

    if (
      linkType !== "pending_organization_dirigeant" &&
      linkType !== "organization_dirigeant"
    )
      return { type: "next" };

    const franceconnectUserInfo = (await getFranceConnectUserInfo(user_id))!;

    const expiredCertification = isExpired(
      linkVerifiedAt,
      CERTIFICATION_DIRIGEANT_MAX_AGE_IN_MINUTES,
    );
    const expiredVerification =
      Number(franceconnectUserInfo.updated_at) > Number(linkVerifiedAt);

    const renewalNeeded = expiredCertification || expiredVerification;

    if (linkType === "organization_dirigeant" && !renewalNeeded)
      return { type: "next" };

    try {
      await processCertificationDirigeantOrThrow(
        organization,
        franceconnectUserInfo,
        user_id,
      );
    } catch (error) {
      if (error instanceof CertificationDirigeantOrganizationNotCoveredError) {
        return {
          type: "redirect",
          url: "/users/certification-dirigeant/organization-not-covered-error",
        };
      }

      if (error instanceof CertificationDirigeantCloseMatchError) {
        return {
          type: "redirect",
          url: getCertificationDirigeantCloseMatchErrorUrl(error),
        };
      }

      if (error instanceof CertificationDirigeantNoMatchError) {
        return {
          type: "redirect",
          url: `/users/certification-dirigeant/no-match-error?siren=${error.siren}`,
        };
      }

      throw error;
    }

    return { type: "next" };
  },
};

export const requireUserHasNoPendingOfficialContactEmailVerification: NavigationGuardNode =
  {
    previous: requireUserPassedCertificationDirigeant,
    guard: async (req) => {
      const userOrganisations = await getOrganizationsByUserId(
        getUserFromAuthenticatedSession(req).id,
      );

      let organizationThatNeedsOfficialContactEmailVerification;
      if (req.session.mustReturnOneOrganizationInPayload) {
        const selectedOrganizationId = await getSelectedOrganizationId(
          getUserFromAuthenticatedSession(req).id,
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
    guard: async (req) => {
      const userOrganisations = await getOrganizationsByUserId(
        getUserFromAuthenticatedSession(req).id,
      );

      let organizationThatNeedsGreetings;

      if (req.session.mustReturnOneOrganizationInPayload) {
        const selectedOrganizationId = await getSelectedOrganizationId(
          getUserFromAuthenticatedSession(req).id,
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
            user_id: getUserFromAuthenticatedSession(req).id,
            organization_id: organizationThatNeedsGreetings.id,
          });
          return { type: "redirect", url: `/users/welcome/dirigeant` };
        }

        await greetForJoiningOrganization({
          user_id: getUserFromAuthenticatedSession(req).id,
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
