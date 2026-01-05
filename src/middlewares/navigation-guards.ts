import { getTrustedReferrerPath } from "@proconnect-gouv/proconnect.core/security";
import { InvalidCertificationError } from "@proconnect-gouv/proconnect.identite/errors";
import { captureException } from "@sentry/node";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import HttpErrors from "http-errors";
import { isEmpty } from "lodash-es";
import { AssertionError } from "node:assert";
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

type NavigationGuardNode = {
  previous?: NavigationGuardNode;
  guard: RequestHandler;
};

export const navigationGuardChain = (
  node: NavigationGuardNode,
): RequestHandler[] => {
  if (!node.previous) return [node.guard];

  return [...navigationGuardChain(node.previous), node.guard];
};

export const requireIsUser: NavigationGuardNode = {
  guard: async (req: Request, _res: Response, next: NextFunction) => {
    if (usesAuthHeaders(req)) {
      throw new HttpErrors.Forbidden(
        "Access denied. The requested resource does not require authentication.",
      );
    }

    return next();
  },
};

// redirect user to start sign-in page if no email is available in session
export const requireEmailInSession: NavigationGuardNode = {
  previous: requireIsUser,
  guard: (req, res, next) => {
    if (isEmpty(getEmailFromUnauthenticatedSession(req))) {
      return res.redirect(`/users/start-sign-in`);
    }

    return next();
  },
};

// redirect user to inclusionconnect welcome page if needed
export const requireUserHasSeenInclusionconnectWelcomePage: NavigationGuardNode =
  {
    previous: requireEmailInSession,
    guard: async (req: Request, res: Response, next: NextFunction) => {
      if (
        getPartialUserFromUnauthenticatedSession(req)
          .needsInclusionconnectWelcomePage
      ) {
        return res.redirect(`/users/inclusionconnect-welcome`);
      }

      return next();
    },
  };

export const requireCredentialPromptRequirements =
  requireUserHasSeenInclusionconnectWelcomePage;

// redirect user to login page if no active session is available
export const requireUserIsConnected: NavigationGuardNode = {
  previous: requireIsUser,
  guard: async (req: Request, res: Response, next: NextFunction) => {
    if (req.method === "HEAD") {
      // From express documentation:
      // The app.get() function is automatically called for the HTTP HEAD method
      // in addition to the GET method if app.head() was not called for the path
      // before app.get().
      // We return empty response and the headers are sent to the client.
      return res.send();
    }

    if (!isWithinAuthenticatedSession(req.session)) {
      const referrerPath = getReferrerPath(req);
      if (referrerPath) {
        req.session.referrerPath = referrerPath;
      }

      return res.redirect(`/users/start-sign-in`);
    }

    return next();
  },
};

export const requireUserHasConnectedRecently: NavigationGuardNode = {
  previous: requireUserIsConnected,
  guard: async (req: Request, res: Response, next: NextFunction) => {
    const hasLoggedInRecently = hasUserAuthenticatedRecently(req);

    if (!hasLoggedInRecently) {
      req.session.referrerPath = getReferrerPath(req);

      return res.redirect(`/users/start-sign-in?notification=login_required`);
    }

    return next();
  },
};

export const requireUserIsVerified: NavigationGuardNode = {
  previous: requireUserIsConnected,
  guard: async (req: Request, res: Response, next: NextFunction) => {
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

      return res.redirect(`/users/verify-email${notification_param}`);
    }

    return next();
  },
};

export const requireUserTwoFactorAuth: NavigationGuardNode = {
  previous: requireUserIsVerified,
  guard: async (req: Request, res: Response, next: NextFunction) => {
    const { id: user_id } = getUserFromAuthenticatedSession(req);

    if (
      ((await shouldForce2faForUser(user_id)) ||
        req.session.twoFactorsAuthRequested) &&
      !isWithinTwoFactorAuthenticatedSession(req)
    ) {
      if (await is2FACapable(user_id)) {
        return res.redirect("/users/2fa-sign-in");
      } else {
        return res.redirect("/users/double-authentication-choice");
      }
    }
    return next();
  },
};

export const requireBrowserIsTrusted: NavigationGuardNode = {
  previous: requireUserTwoFactorAuth,
  guard: async (req: Request, res: Response, next: NextFunction) => {
    const is_browser_trusted = isBrowserTrustedForUser(req);

    if (!is_browser_trusted) {
      return res.redirect(
        `/users/verify-email?notification=browser_not_trusted`,
      );
    }

    return next();
  },
};

export const requireUserIsFranceConnected: NavigationGuardNode = {
  previous: requireBrowserIsTrusted,
  guard: async (req: Request, res: Response, next: NextFunction) => {
    if (FEATURE_CONSIDER_ALL_USERS_AS_CERTIFIED) return next();

    const { certificationDirigeantRequested: isRequested } =
      await CertificationSessionSchema.parseAsync(req.session);
    if (!isRequested) return next();

    const { id: userId } = getUserFromAuthenticatedSession(req);
    const isVerified = await isUserVerifiedWithFranceconnect(userId);

    if (isVerified) return next();

    return res.redirect("/users/certification-dirigeant");
  },
};

export const requireUserHasPersonalInformations: NavigationGuardNode = {
  previous: requireUserIsFranceConnected,
  guard: async (req: Request, res: Response, next: NextFunction) => {
    const { given_name, family_name } = getUserFromAuthenticatedSession(req);
    if (isEmpty(given_name) || isEmpty(family_name)) {
      return res.redirect("/users/personal-information");
    }

    return next();
  },
};

export const requireUserHasAtLeastOneOrganization: NavigationGuardNode = {
  previous: requireUserHasPersonalInformations,
  guard: async (req: Request, res: Response, next: NextFunction) => {
    if (
      isEmpty(
        await getOrganizationsByUserId(getUserFromAuthenticatedSession(req).id),
      )
    ) {
      return res.redirect(
        addQueryParameters("/users/join-organization", {
          siret_hint: req.session.siretHint,
        }),
      );
    }

    return next();
  },
};

export const requireUserCanAccessApp = requireUserHasAtLeastOneOrganization;

export const requireUserHasLoggedInRecently: NavigationGuardNode = {
  previous: requireUserCanAccessApp,
  guard: async (req: Request, res: Response, next: NextFunction) => {
    const hasLoggedInRecently = hasUserAuthenticatedRecently(req);

    if (!hasLoggedInRecently) {
      req.session.referrerPath = getReferrerPath(req);

      return res.redirect(`/users/start-sign-in?notification=login_required`);
    }

    return next();
  },
};

export const requireUserTwoFactorAuthForAdmin: NavigationGuardNode = {
  previous: requireUserHasLoggedInRecently,
  guard: async (req: Request, res: Response, next: NextFunction) => {
    const { id: user_id } = getUserFromAuthenticatedSession(req);

    if (
      (await is2FACapable(user_id)) &&
      !isWithinTwoFactorAuthenticatedSession(req)
    ) {
      req.session.referrerPath = getReferrerPath(req);

      return res.redirect("/users/2fa-sign-in?notification=2fa_required");
    }

    return next();
  },
};

export const requireUserCanAccessAdmin = requireUserTwoFactorAuthForAdmin;

const requireUserBelongsToHintedOrganization: NavigationGuardNode = {
  previous: requireUserHasAtLeastOneOrganization,
  guard: async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.siretHint) {
      return next();
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
      return next();
    } else {
      return res.redirect(
        `/users/join-organization?siret_hint=${req.session.siretHint}`,
      );
    }
  },
};

export const requireUserHasSelectedAnOrganization: NavigationGuardNode = {
  previous: requireUserBelongsToHintedOrganization,
  guard: async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.mustReturnOneOrganizationInPayload) return next();

    const selectedOrganizationId = await getSelectedOrganizationId(
      getUserFromAuthenticatedSession(req).id,
    );

    if (selectedOrganizationId) {
      return next();
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
      return next();
    }

    return res.redirect("/users/select-organization");
  },
};

export const requireUserPassedCertificationDirigeant: NavigationGuardNode = {
  previous: requireUserHasSelectedAnOrganization,
  guard: async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.mustReturnOneOrganizationInPayload) return next();

    if (FEATURE_CONSIDER_ALL_USERS_AS_CERTIFIED) return next();
    if (!req.session.certificationDirigeantRequested) return next();

    const { id: user_id } = getUserFromAuthenticatedSession(req);
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
      return next();
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
        ? res.redirect(
            "/users/unable-to-certify-user-as-executive?matches=" +
              [...matches].join(","),
          )
        : res.redirect("/users/unable-to-certify-user-as-executive");
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

    return next();
  },
};

export const requireUserHasNoPendingOfficialContactEmailVerification: NavigationGuardNode =
  {
    previous: requireUserPassedCertificationDirigeant,
    guard: async (req: Request, res: Response, next: NextFunction) => {
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
        return res.redirect(
          `/users/official-contact-email-verification/${organizationThatNeedsOfficialContactEmailVerification.id}`,
        );
      }

      return next();
    },
  };

export const requireUserHasBeenGreetedForJoiningOrganization: NavigationGuardNode =
  {
    previous: requireUserHasNoPendingOfficialContactEmailVerification,
    guard: async (req: Request, res: Response, next: NextFunction) => {
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
          return res.redirect(`/users/welcome/dirigeant`);
        }

        await greetForJoiningOrganization({
          user_id: getUserFromAuthenticatedSession(req).id,
          organization_id: organizationThatNeedsGreetings.id,
        });

        return res.redirect(`/users/welcome`);
      }

      return next();
    },
  };

// check that the user goes through all requirements before issuing a session
export const requireUserSignInRequirements =
  requireUserHasBeenGreetedForJoiningOrganization;
