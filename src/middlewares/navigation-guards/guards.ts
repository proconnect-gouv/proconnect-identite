import {
  type BaseUserOrganizationLink,
  LinkEnum,
  type Organization,
} from "@proconnect-gouv/proconnect.identite/types";
import HttpErrors from "http-errors";
import isEmpty from "lodash-es/isEmpty";
import { CERTIFICATION_DIRIGEANT_MAX_AGE_IN_MINUTES } from "../../config/env";
import { context } from "../../connectors/context";
import {
  doesOrganizationRequireForced2fa,
  is2FACapable,
  shouldForce2faForUser,
} from "../../managers/2fa";
import { isBrowserTrustedForUser } from "../../managers/browser-authentication";
import { selectOrganization } from "../../managers/organization/main";
import {
  getCurrentAcr,
  getUserFromAuthenticatedSession,
  hasUserAuthenticatedRecently,
  isWithinAuthenticatedSession,
  isWithinTwoFactorAuthenticatedSession,
  updateUserInAuthenticatedSession,
} from "../../managers/session/authenticated";
import {
  getEmailFromUnauthenticatedSession,
  getPartialUserFromUnauthenticatedSession,
} from "../../managers/session/unauthenticated";
import {
  hasValidFranceConnectIdentity,
  lastFranceConnectIdentityUpdate,
  needsEmailVerificationRenewal,
  needsFranceConnectIdentityRenewal,
} from "../../managers/user";
import { getSelectedOrganizationId } from "../../repositories/redis/selected-organization";
import { isAcrSatisfied } from "../../services/acr-checks";
import { isExpired } from "../../services/is-expired";
import { usesAuthHeaders } from "../../services/uses-auth-headers";
import { Pass, type RequestContext } from "./internals";
import { process } from "./process";

const { franceconnect_userinfo, organizations, users, users_organizations } =
  context.repository;

export const isUserGuard = ({ data: { req }, pass }: Pass<RequestContext>) => {
  if (usesAuthHeaders(req)) {
    throw new HttpErrors.Forbidden(
      "Access denied. The requested resource does not require authentication.",
    );
  }
  return pass("is_user");
};

export const userHasProvidedAnEmailGuard = (prev: Pass<RequestContext>) => {
  const {
    data: { req },
    pass,
    haltTo,
  } = prev;
  if (isEmpty(getEmailFromUnauthenticatedSession(req))) {
    return haltTo("/users/start-sign-in");
  }
  return pass("user_has_provided_an_email");
};

export const userHasSeenInclusionconnectWelcomePageGuard = (
  prev: Pass<RequestContext>,
) => {
  const {
    data: { req },
    pass,
    haltTo,
  } = prev;
  if (
    getPartialUserFromUnauthenticatedSession(req)
      .needsInclusionconnectWelcomePage
  ) {
    return haltTo("/users/inclusionconnect-welcome");
  }
  return pass("user_has_seen_inclusionconnect_welcome_page");
};

export const userIsAuthenticatedGuard = (prev: Pass<RequestContext>) => {
  const {
    data: { req },
    pass,
    haltTo,
    send,
  } = prev;
  if (req.method === "HEAD") {
    // From express documentation:
    // The app.get() function is automatically called for the HTTP HEAD method
    // in addition to the GET method if app.head() was not called for the path
    // before app.get().
    // We return an empty response, and the headers are sent to the client.
    return send();
  }

  if (!isWithinAuthenticatedSession(req.session)) {
    return haltTo("/users/start-sign-in");
  }

  return pass("user_is_authenticated");
};

export const userHasAuthenticatedRecentlyGuard = async (
  prev: Pass<RequestContext>,
) => {
  const {
    data: { req },
    pass,
    haltTo,
  } = prev;

  const hasLoggedInRecently = hasUserAuthenticatedRecently(req);
  if (!hasLoggedInRecently) {
    return haltTo(`/users/start-sign-in?notification=login_required`);
  }

  return pass("user_has_authenticated_recently");
};

export const userIsMfaAuthenticatedIfCapableGuard = async (
  prev: Pass<RequestContext>,
) => {
  const {
    data: { req },
    pass,
    haltTo,
  } = prev;

  const { id: user_id } = getUserFromAuthenticatedSession(req);

  if (
    (await is2FACapable(user_id)) &&
    !isWithinTwoFactorAuthenticatedSession(req)
  ) {
    return haltTo("/users/2fa-sign-in?notification=2fa_required");
  }

  return pass("user_is_mfa_authenticated_if_capable");
};

export const browserIsTrustedGuard = async (prev: Pass<RequestContext>) => {
  const {
    data: { req },
    pass,
    haltTo,
  } = prev;

  const is_browser_trusted = isBrowserTrustedForUser(req);
  if (!is_browser_trusted) {
    return haltTo("/users/verify-email?notification=browser_not_trusted");
  }

  return pass("browser_is_trusted");
};

export const userIsVerifiedGuard = async (prev: Pass<RequestContext>) => {
  const {
    data: { req },
    pass,
    haltTo,
  } = prev;
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
    return haltTo(`/users/verify-email${notification_param}`);
  }
  return pass("user_is_verified");
};

export const userIsMfaAuthenticatedIfRequiredGuard = async (
  prev: Pass<RequestContext>,
) => {
  const {
    data: { req },
    pass,
    haltTo,
  } = prev;
  const { id: user_id } = getUserFromAuthenticatedSession(req);
  // Note:
  // - forcedIAL is set to 1 since the user can elevate it to level 1 when necessary
  // - forcedOAL is set to 1 to maintain a consistent value set that doesn't impact the AAL.
  const isAcrCurrentlySatisfied = isAcrSatisfied(
    req.session.prompt,
    await getCurrentAcr(req, { forcedIAL: 1, forcedOAL: 1 }),
  );
  const wouldRequestedAcrBeSatisfiedIfAccountHasMfaSetup = isAcrSatisfied(
    req.session.prompt,
    await getCurrentAcr(req, { forcedIAL: 1, forcedAAL: 2, forcedOAL: 1 }),
  );

  if (
    (!isAcrCurrentlySatisfied &&
      wouldRequestedAcrBeSatisfiedIfAccountHasMfaSetup) ||
    ((await shouldForce2faForUser(user_id)) &&
      !isWithinTwoFactorAuthenticatedSession(req))
  ) {
    if (await is2FACapable(user_id)) {
      return haltTo("/users/2fa-sign-in");
    } else {
      return haltTo("/users/double-authentication-choice");
    }
  }

  return pass("user_is_mfa_authenticated_if_required");
};

export const userHasSeenInclusionconnectOnboardingHelpGuard = async (
  prev: Pass<RequestContext>,
) => {
  const {
    data: { req },
    pass,
    haltTo,
  } = prev;
  const { id: user_id, needs_inclusionconnect_onboarding_help } =
    getUserFromAuthenticatedSession(req);
  if (needs_inclusionconnect_onboarding_help) {
    const user = await users.update(user_id, {
      needs_inclusionconnect_onboarding_help: false,
    });
    updateUserInAuthenticatedSession(req, user);

    return haltTo("/users/welcome?show_inclusion_connect_onboarding_help=true");
  }
  return pass("user_has_seen_inclusionconnect_onboarding_help");
};

export const userHasAtLeastOneOrganizationGuard = async (
  prev: Pass<RequestContext>,
) => {
  const {
    data: { req },
    haltTo,
    pass,
  } = prev;

  const userOrganizations = await organizations.findByUserId(
    getUserFromAuthenticatedSession(req).id,
  );
  if (isEmpty(userOrganizations)) {
    if (req.session.siretHint) {
      return haltTo(
        `/users/join-organization?siret_hint=${req.session.siretHint}`,
      );
    } else {
      return haltTo("/users/join-organization");
    }
  }

  return pass("user_has_at_least_one_organization").extends({
    userOrganizations,
  });
};

export const userBelongsToHintedOrganizationGuard = async <
  TContext extends RequestContext & {
    userOrganizations: (Organization & BaseUserOrganizationLink)[];
  },
>(
  context: Pass<TContext>,
) => {
  const {
    data: { req, userOrganizations },
    pass,
    haltTo,
  } = context;
  if (req.session.siretHint) {
    const hintedOrganization = await organizations.findBySiret(
      req.session.siretHint,
    );
    const userFromAuthenticatedSession = getUserFromAuthenticatedSession(req);

    if (isEmpty(hintedOrganization))
      return haltTo(
        `/users/join-organization?siret_hint=${req.session.siretHint}`,
      );

    if (!userOrganizations.some((org) => org.id === hintedOrganization.id)) {
      return haltTo(
        `/users/join-organization?siret_hint=${req.session.siretHint}`,
      );
    }

    await selectOrganization({
      user_id: userFromAuthenticatedSession.id,
      organization_id: hintedOrganization.id,
    });
  }

  return pass("user_belongs_to_hinted_organization");
};

export const userHasSelectedAnOrganizationGuard = async <
  TContext extends RequestContext & {
    userOrganizations: (Organization & BaseUserOrganizationLink)[];
  },
>(
  context: Pass<TContext>,
) => {
  const {
    data: { req, userOrganizations },
    pass,
    haltTo,
  } = context;

  const selectedOrganizationId = await getSelectedOrganizationId(
    getUserFromAuthenticatedSession(req).id,
  );

  if (!selectedOrganizationId) {
    if (
      userOrganizations.length === 1 &&
      !req.session.certificationDirigeantRequested
    ) {
      await selectOrganization({
        user_id: getUserFromAuthenticatedSession(req).id,
        organization_id: userOrganizations[0].id,
      });
      return pass("side_effect_user_has_selected_an_organization").extends({
        selectedOrganizationId: userOrganizations[0].id,
      });
    }

    return haltTo("/users/select-organization");
  }

  return pass("user_has_selected_an_organization").extends({
    selectedOrganizationId,
  });
};

export const userIsMfaAuthenticatedIfOrganizationRequiresIt = async <
  TContext extends RequestContext & {
    userOrganizations: (Organization & BaseUserOrganizationLink)[];
    selectedOrganizationId: number;
  },
>(
  context: Pass<TContext>,
) => {
  const {
    data: { req, selectedOrganizationId },
    pass,
    haltTo,
  } = context;
  const { id: user_id } = getUserFromAuthenticatedSession(req);

  if (
    (await doesOrganizationRequireForced2fa(selectedOrganizationId)) &&
    !isWithinTwoFactorAuthenticatedSession(req)
  ) {
    if (await is2FACapable(user_id)) {
      return haltTo("/users/2fa-sign-in");
    } else {
      return haltTo(
        "/users/double-authentication-choice?notification=organization_requires_forced_2fa",
      );
    }
  }

  return pass("user_is_mfa_authenticated_if_organization_requires_it");
};

export const userHasValidFranceConnectIdentityGuard = async <
  TContext extends RequestContext,
>(
  context: Pass<TContext>,
) => {
  const {
    data: { req },
    pass,
    haltTo,
  } = context;

  const { id: user_id } = getUserFromAuthenticatedSession(req);

  if (
    (await lastFranceConnectIdentityUpdate(user_id)) &&
    (await needsFranceConnectIdentityRenewal(user_id))
  ) {
    return haltTo("/users/franceconnect");
  }
  // Note:
  // - forcedAAL is set to 2 since the user can elevate it to level 2 when necessary.
  const isAcrCurrentlySatisfied = isAcrSatisfied(
    req.session.prompt,
    await getCurrentAcr(req, { forcedAAL: 2 }),
  );
  const wouldRequestedAcrBeSatisfiedIfAccountHasFCSetup = isAcrSatisfied(
    req.session.prompt,
    await getCurrentAcr(req, { forcedIAL: 1, forcedAAL: 2 }),
  );

  const requestedAcrRequiresFranceConnection =
    !isAcrCurrentlySatisfied && wouldRequestedAcrBeSatisfiedIfAccountHasFCSetup;

  if (
    requestedAcrRequiresFranceConnection &&
    !(await hasValidFranceConnectIdentity(user_id))
  ) {
    return haltTo("/users/franceconnect");
  }

  return pass("user_has_valid_franceconnect_identity");
};

export const userHasPersonalInformationsGuard = async <
  TContext extends RequestContext,
>(
  context: Pass<TContext>,
) => {
  const {
    data: { req },
    pass,
    haltTo,
  } = context;

  const { given_name, family_name } = getUserFromAuthenticatedSession(req);
  if (isEmpty(given_name) || isEmpty(family_name)) {
    return haltTo("/users/personal-information");
  }

  return pass("user_has_personal_informations");
};

export const userIsCertifiedAsDirigeantGuard = async <
  TContext extends RequestContext & { selectedOrganizationId: number },
>(
  context: Pass<TContext>,
) => {
  const {
    data: { req, selectedOrganizationId: organizationId },
    pass,
  } = context;

  const { id: user_id } = getUserFromAuthenticatedSession(req);
  const { verification_type: linkType, verified_at: linkVerifiedAt } =
    (await users_organizations.find({
      organization_id: organizationId,
      user_id,
    }))!;

  if (
    req.session.certificationDirigeantRequested &&
    linkType !== LinkEnum.enum.organization_dirigeant
  ) {
    req.session.pendingCertificationDirigeantOrganizationId = organizationId;
    return process(context);
  }

  if (linkType === LinkEnum.enum.organization_dirigeant) {
    const franceconnectUserInfo = (await franceconnect_userinfo.find(user_id))!;
    const expiredCertification = isExpired(
      linkVerifiedAt,
      CERTIFICATION_DIRIGEANT_MAX_AGE_IN_MINUTES,
    );
    const expiredVerification =
      Number(franceconnectUserInfo.updated_at) > Number(linkVerifiedAt);

    const renewalNeeded = expiredCertification || expiredVerification;
    if (renewalNeeded) {
      req.session.pendingCertificationDirigeantOrganizationId = organizationId;
      return process(context);
    }
  }

  return pass("user_is_certified_as_dirigeant");
};
