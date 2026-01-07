import { getTrustedReferrerPath } from "@proconnect-gouv/proconnect.core/security";
import {
  InvalidCertificationError,
  UserNotFoundError,
} from "@proconnect-gouv/proconnect.identite/errors";
import { captureException } from "@sentry/node";
import type { NextFunction, Request, Response } from "express";
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
  destroyAuthenticatedSession,
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

type MiddlewareResult = void | { redirect: string } | "send";

type Middleware = (req: Request, res: Response, next: NextFunction) => void;
type SimpleMiddleware = (req: Request) => Promise<MiddlewareResult>;

function autoNext(fn: SimpleMiddleware): Middleware {
  return async (req, res, next) => {
    const result = await fn(req);
    if (result === "send") {
      return res.send();
    } else if (result && typeof result === "object" && "redirect" in result) {
      return res.redirect(result.redirect);
    } else if (result === undefined) {
      return next();
    } else {
      throw new Error("Invalid middleware result");
    }
  };
}

function chain(first: Middleware, second: SimpleMiddleware): Middleware {
  return (req, res, next) => {
    first(req, res, async (error: any) => {
      try {
        if (error) return next(error);
        await autoNext(second)(req, res, next);
      } catch (err) {
        next(err);
      }
    });
  };
}

export const checkIsUser: Middleware = autoNext(async (req) => {
  if (usesAuthHeaders(req)) {
    throw new HttpErrors.Forbidden(
      "Access denied. The requested resource does not require authentication.",
    );
  }
});

// redirect user to start sign in page if no email is available in session
export const checkEmailInSessionMiddleware = chain(checkIsUser, async (req) => {
  if (isEmpty(getEmailFromUnauthenticatedSession(req))) {
    return { redirect: `/users/start-sign-in` };
  }
});

// redirect user to inclusionconnect welcome page if needed
export const checkUserHasSeenInclusionconnectWelcomePage = chain(
  checkEmailInSessionMiddleware,
  async (req) => {
    if (
      getPartialUserFromUnauthenticatedSession(req)
        .needsInclusionconnectWelcomePage
    ) {
      return { redirect: `/users/inclusionconnect-welcome` };
    }
  },
);

export const checkCredentialPromptRequirementsMiddleware =
  checkUserHasSeenInclusionconnectWelcomePage;

// redirect user to login page if no active session is available
export const checkUserIsConnectedMiddleware = chain(
  checkIsUser,
  async (req) => {
    if (req.method === "HEAD") {
      // From express documentation:
      // The app.get() function is automatically called for the HTTP HEAD method
      // in addition to the GET method if app.head() was not called for the path
      // before app.get().
      // We return empty response and the headers are sent to the client.
      return "send";
    }

    if (!isWithinAuthenticatedSession(req.session)) {
      const referrerPath = getReferrerPath(req);
      if (referrerPath) {
        req.session.referrerPath = referrerPath;
      }

      return { redirect: `/users/start-sign-in` };
    }
  },
);

export const checkUserHasConnectedRecentlyMiddleware = chain(
  checkUserIsConnectedMiddleware,
  async (req) => {
    const hasLoggedInRecently = hasUserAuthenticatedRecently(req);

    if (!hasLoggedInRecently) {
      req.session.referrerPath = getReferrerPath(req);

      return { redirect: `/users/start-sign-in?notification=login_required` };
    }
  },
);

export const checkUserIsVerifiedMiddleware = chain(
  checkUserIsConnectedMiddleware,
  async (req) => {
    try {
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

        return { redirect: `/users/verify-email${notification_param}` };
      }
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        // The user has an active session but is not in the database anymore
        await destroyAuthenticatedSession(req);
        throw new HttpErrors.Unauthorized();
      }
      throw error;
    }
  },
);

export const checkUserTwoFactorAuthMiddleware = chain(
  checkUserIsVerifiedMiddleware,
  async (req) => {
    try {
      const { id: user_id } = getUserFromAuthenticatedSession(req);

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
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        // The user has an active session but is not in the database anymore
        await destroyAuthenticatedSession(req);
        throw new HttpErrors.Unauthorized();
      }
      throw error;
    }
  },
);

export const checkBrowserIsTrustedMiddleware = chain(
  checkUserTwoFactorAuthMiddleware,
  async (req) => {
    const is_browser_trusted = isBrowserTrustedForUser(req);

    if (!is_browser_trusted) {
      return {
        redirect: `/users/verify-email?notification=browser_not_trusted`,
      };
    }
  },
);

export const checkUserIsFranceConnectedMiddleware = chain(
  checkBrowserIsTrustedMiddleware,
  async (req) => {
    if (FEATURE_CONSIDER_ALL_USERS_AS_CERTIFIED) return;

    const { certificationDirigeantRequested: isRequested } =
      await CertificationSessionSchema.parseAsync(req.session);
    if (!isRequested) return;

    const { id: userId } = getUserFromAuthenticatedSession(req);
    const isVerified = await isUserVerifiedWithFranceconnect(userId);

    if (isVerified) return;

    return { redirect: "/users/certification-dirigeant" };
  },
);

export const checkUserHasPersonalInformationsMiddleware = chain(
  checkUserIsFranceConnectedMiddleware,
  async (req) => {
    const { given_name, family_name } = getUserFromAuthenticatedSession(req);
    if (isEmpty(given_name) || isEmpty(family_name)) {
      return { redirect: "/users/personal-information" };
    }
  },
);

export const checkUserHasAtLeastOneOrganizationMiddleware = chain(
  checkUserHasPersonalInformationsMiddleware,
  async (req) => {
    if (
      isEmpty(
        await getOrganizationsByUserId(getUserFromAuthenticatedSession(req).id),
      )
    ) {
      return {
        redirect: addQueryParameters("/users/join-organization", {
          siret_hint: req.session.siretHint,
        }),
      };
    }
  },
);

export const checkUserCanAccessAppMiddleware =
  checkUserHasAtLeastOneOrganizationMiddleware;

export const checkUserHasLoggedInRecentlyMiddleware = chain(
  checkUserCanAccessAppMiddleware,
  async (req) => {
    const hasLoggedInRecently = hasUserAuthenticatedRecently(req);

    if (!hasLoggedInRecently) {
      req.session.referrerPath = getReferrerPath(req);

      return { redirect: `/users/start-sign-in?notification=login_required` };
    }
  },
);

export const checkUserTwoFactorAuthForAdminMiddleware = chain(
  checkUserHasLoggedInRecentlyMiddleware,
  async (req) => {
    const { id: user_id } = getUserFromAuthenticatedSession(req);

    if (
      (await is2FACapable(user_id)) &&
      !isWithinTwoFactorAuthenticatedSession(req)
    ) {
      req.session.referrerPath = getReferrerPath(req);

      return { redirect: "/users/2fa-sign-in?notification=2fa_required" };
    }
  },
);

export const checkUserCanAccessAdminMiddleware =
  checkUserTwoFactorAuthForAdminMiddleware;

const checkUserBelongsToHintedOrganizationMiddleware = chain(
  checkUserHasAtLeastOneOrganizationMiddleware,
  async (req) => {
    if (!req.session.siretHint) {
      return;
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
    } else {
      return {
        redirect: `/users/join-organization?siret_hint=${req.session.siretHint}`,
      };
    }
  },
);

export const checkUserHasSelectedAnOrganizationMiddleware = chain(
  checkUserBelongsToHintedOrganizationMiddleware,
  async (req) => {
    if (!req.session.mustReturnOneOrganizationInPayload) return;

    const selectedOrganizationId = await getSelectedOrganizationId(
      getUserFromAuthenticatedSession(req).id,
    );

    if (selectedOrganizationId) {
      return;
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
      return;
    }

    return { redirect: "/users/select-organization" };
  },
);

export const checkUserPassedCertificationDirigeant = chain(
  checkUserHasSelectedAnOrganizationMiddleware,
  async (req) => {
    if (!req.session.mustReturnOneOrganizationInPayload) return;

    if (FEATURE_CONSIDER_ALL_USERS_AS_CERTIFIED) return;
    if (!req.session.certificationDirigeantRequested) return;

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
      return;
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

      return {
        redirect: matches
          ? "/users/unable-to-certify-user-as-executive?matches=" +
            [...matches].join(",")
          : "/users/unable-to-certify-user-as-executive",
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
  },
);

export const checkUserHasNoPendingOfficialContactEmailVerificationMiddleware =
  chain(checkUserPassedCertificationDirigeant, async (req) => {
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
        redirect: `/users/official-contact-email-verification/${organizationThatNeedsOfficialContactEmailVerification.id}`,
      };
    }
  });

///

export const checkUserHasBeenGreetedForJoiningOrganizationMiddleware = chain(
  checkUserHasNoPendingOfficialContactEmailVerificationMiddleware,
  async (req) => {
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
        return { redirect: `/users/welcome/dirigeant` };
      }

      await greetForJoiningOrganization({
        user_id: getUserFromAuthenticatedSession(req).id,
        organization_id: organizationThatNeedsGreetings.id,
      });

      return { redirect: `/users/welcome` };
    }
  },
);

// check that user go through all requirements before issuing a session
export const checkUserSignInRequirementsMiddleware =
  checkUserHasBeenGreetedForJoiningOrganizationMiddleware;
