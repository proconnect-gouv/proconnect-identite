import { getTrustedReferrerPath } from "@gouvfr-lasuite/proconnect.core/security";
import {
  InvalidCertificationError,
  NotFoundError,
  UserNotFoundError,
} from "@gouvfr-lasuite/proconnect.identite/errors";
import type { NextFunction, Request, Response } from "express";
import HttpErrors from "http-errors";
import { isEmpty } from "lodash-es";
import {
  CERTIFICATION_DIRIGEANT_MAX_AGE_IN_MINUTES,
  FEATURE_CONSIDER_ALL_USERS_AS_CERTIFIED,
  HOST,
} from "../config/env";
import { is2FACapable, shouldForce2faForUser } from "../managers/2fa";
import { isBrowserTrustedForUser } from "../managers/browser-authentication";
import { isOrganizationDirigeant } from "../managers/certification";
import {
  greetForCertification,
  greetForJoiningOrganization,
} from "../managers/organization/join";
import {
  getOrganizationById,
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
import { clearInteractionSession } from "../managers/session/interaction";
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

export const checkIsUser = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    if (usesAuthHeaders(req)) {
      return next(
        new HttpErrors.Forbidden(
          "Access denied. The requested resource does not require authentication.",
        ),
      );
    }

    return next();
  } catch (error) {
    next(error);
  }
};

// redirect user to start sign in page if no email is available in session
export const checkEmailInSessionMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await checkIsUser(req, res, async (error) => {
    try {
      if (error) return next(error);

      if (isEmpty(getEmailFromUnauthenticatedSession(req))) {
        return res.redirect(`/users/start-sign-in`);
      }

      return next();
    } catch (error) {
      next(error);
    }
  });
};

// redirect user to inclusionconnect welcome page if needed
export const checkUserHasSeenInclusionconnectWelcomePage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await checkEmailInSessionMiddleware(req, res, async (error) => {
    try {
      if (error) next(error);

      if (
        getPartialUserFromUnauthenticatedSession(req)
          .needsInclusionconnectWelcomePage
      ) {
        return res.redirect(`/users/inclusionconnect-welcome`);
      }

      return next();
    } catch (error) {
      next(error);
    }
  });
};

export const checkCredentialPromptRequirementsMiddleware =
  checkUserHasSeenInclusionconnectWelcomePage;

// redirect user to login page if no active session is available
export const checkUserIsConnectedMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await checkIsUser(req, res, async (error) => {
    try {
      if (error) return next(error);

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
    } catch (error) {
      next(error);
    }
  });
};

export const checkUserTwoFactorAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await checkUserIsConnectedMiddleware(req, res, async (error) => {
    try {
      if (error) next(error);

      const { id: user_id } = getUserFromAuthenticatedSession(req);

      if (
        ((await shouldForce2faForUser(user_id)) ||
          req.session.twoFactorsAuthRequested) &&
        !isWithinTwoFactorAuthenticatedSession(req)
      ) {
        if (await is2FACapable(user_id)) {
          return res.redirect("/users/2fa-sign-in");
        } else {
          // faire code ici pour la 2fa forcée

          // We break the connexion flow

          clearInteractionSession(req);

          return res.redirect("/users/double-authentication-choice");
        }
      }
      return next();
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        // The user has an active session but is not in the database anymore
        await destroyAuthenticatedSession(req);
        next(new HttpErrors.Unauthorized());
      }
      next(error);
    }
  });
};

export const checkUserIsVerifiedMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) =>
  checkUserTwoFactorAuthMiddleware(req, res, async (error) => {
    try {
      if (error) return next(error);

      const { email, email_verified } = getUserFromAuthenticatedSession(req);

      const needs_email_verification_renewal =
        await needsEmailVerificationRenewal(email);

      const is_browser_trusted = isBrowserTrustedForUser(req);

      if (
        !email_verified ||
        needs_email_verification_renewal ||
        !is_browser_trusted
      ) {
        let notification_param = "";

        if (!email_verified) {
          notification_param = "";
        } else if (needs_email_verification_renewal) {
          notification_param = "?notification=email_verification_renewal";
        } else if (!is_browser_trusted) {
          notification_param = "?notification=browser_not_trusted";
        }

        return res.redirect(`/users/verify-email${notification_param}`);
      }

      return next();
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        // The user has an active session but is not in the database anymore
        await destroyAuthenticatedSession(req);
        next(new HttpErrors.Unauthorized());
      }

      next(error);
    }
  });

export const checkUserNeedCertificationDirigeantMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) =>
  checkUserIsVerifiedMiddleware(req, res, async (error) => {
    try {
      if (error) return next(error);
      if (FEATURE_CONSIDER_ALL_USERS_AS_CERTIFIED) return next();

      const { certificationDirigeantRequested: isRequested } =
        await CertificationSessionSchema.parseAsync(req.session);
      if (!isRequested) return next();

      const { id: userId } = getUserFromAuthenticatedSession(req);
      const isVerified = await isUserVerifiedWithFranceconnect(userId);

      if (isVerified) return next();

      return res.redirect("/users/certification-dirigeant");
    } catch (error) {
      next(error);
    }
  });

export const checkUserHasPersonalInformationsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) =>
  checkUserNeedCertificationDirigeantMiddleware(req, res, async (error) => {
    try {
      if (error) return next(error);
      const { given_name, family_name, job } =
        getUserFromAuthenticatedSession(req);
      if (isEmpty(given_name) || isEmpty(family_name) || isEmpty(job)) {
        return res.redirect("/users/personal-information");
      }

      return next();
    } catch (error) {
      next(error);
    }
  });

export const checkUserHasAtLeastOneOrganizationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) =>
  checkUserHasPersonalInformationsMiddleware(req, res, async (error) => {
    try {
      if (error) return next(error);

      if (
        isEmpty(
          await getOrganizationsByUserId(
            getUserFromAuthenticatedSession(req).id,
          ),
        )
      ) {
        return res.redirect("/users/join-organization");
      }

      return next();
    } catch (error) {
      next(error);
    }
  });

export const checkUserCanAccessAppMiddleware =
  checkUserHasAtLeastOneOrganizationMiddleware;

export const checkUserHasLoggedInRecentlyMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) =>
  checkUserCanAccessAppMiddleware(req, res, async (error) => {
    try {
      if (error) return next(error);

      const hasLoggedInRecently = hasUserAuthenticatedRecently(req);

      if (!hasLoggedInRecently) {
        req.session.referrerPath = getReferrerPath(req);

        return res.redirect(`/users/start-sign-in?notification=login_required`);
      }

      next();
    } catch (error) {
      next(error);
    }
  });

export const checkUserTwoFactorAuthForAdminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) =>
  checkUserHasLoggedInRecentlyMiddleware(req, res, async (error) => {
    try {
      if (error) return next(error);

      const { id: user_id } = getUserFromAuthenticatedSession(req);

      if (
        (await is2FACapable(user_id)) &&
        !isWithinTwoFactorAuthenticatedSession(req)
      ) {
        req.session.referrerPath = getReferrerPath(req);

        return res.redirect("/users/2fa-sign-in?notification=2fa_required");
      }

      return next();
    } catch (error) {
      next(error);
    }
  });

export const checkUserCanAccessAdminMiddleware =
  checkUserTwoFactorAuthForAdminMiddleware;

export const checkUserHasSelectedAnOrganizationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) =>
  checkUserHasAtLeastOneOrganizationMiddleware(req, res, async (error) => {
    try {
      if (error) return next(error);

      const selectedOrganizationId = await getSelectedOrganizationId(
        getUserFromAuthenticatedSession(req).id,
      );
      if (selectedOrganizationId) return next();

      if (req.session.certificationDirigeantRequested) {
        return res.redirect("/users/select-organization");
      }

      if (req.session.mustReturnOneOrganizationInPayload) {
        const userOrganisations = await getOrganizationsByUserId(
          getUserFromAuthenticatedSession(req).id,
        );

        if (userOrganisations.length === 1) {
          await selectOrganization({
            user_id: getUserFromAuthenticatedSession(req).id,
            organization_id: userOrganisations[0].id,
          });
        } else {
          return res.redirect("/users/select-organization");
        }
      }

      return next();
    } catch (error) {
      next(error);
    }
  });

export function checkUserWantToRepresentAnOrganization(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  return checkUserHasSelectedAnOrganizationMiddleware(
    req,
    res,
    async (error) => {
      try {
        if (error) return next(error);
        if (FEATURE_CONSIDER_ALL_USERS_AS_CERTIFIED) return next();
        if (!req.session.certificationDirigeantRequested) return next();

        const { id: user_id } = getUserFromAuthenticatedSession(req);
        const selectedOrganizationId = await getSelectedOrganizationId(user_id);
        if (selectedOrganizationId === null) return next();

        const organization = await getOrganizationById(selectedOrganizationId);
        if (isEmpty(organization)) {
          throw new NotFoundError("Organization not found");
        }

        const userOrganizationLink = await getUserOrganizationLink(
          selectedOrganizationId,
          user_id,
        );
        if (isEmpty(userOrganizationLink)) {
          throw new NotFoundError("User in organization not found");
        }

        const franceconnectUserInfo = await getFranceConnectUserInfo(user_id);
        if (isEmpty(franceconnectUserInfo)) {
          throw new NotFoundError("FranceConnect user info not found");
        }

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

        const isDirigeant = await isOrganizationDirigeant(
          organization.siret,
          user_id,
        );
        if (!isDirigeant) throw new InvalidCertificationError();

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

        next();
      } catch (error) {
        if (error instanceof InvalidCertificationError) {
          return res.redirect("/users/unable-to-certify-user-as-executive");
        }
        next(error);
      }
    },
  );
}

export const checkUserHasNoPendingOfficialContactEmailVerificationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) =>
  checkUserWantToRepresentAnOrganization(req, res, async (error) => {
    try {
      if (error) return next(error);

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
    } catch (error) {
      next(error);
    }
  });

///

export const checkUserHasBeenGreetedForJoiningOrganizationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) =>
  checkUserHasNoPendingOfficialContactEmailVerificationMiddleware(
    req,
    res,
    async (error) => {
      try {
        if (error) return next(error);

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
      } catch (error) {
        next(error);
      }
    },
  );

// check that user go through all requirements before issuing a session
export const checkUserSignInRequirementsMiddleware =
  checkUserHasBeenGreetedForJoiningOrganizationMiddleware;
