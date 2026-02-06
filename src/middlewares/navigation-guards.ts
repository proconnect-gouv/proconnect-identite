import { getTrustedReferrerPath } from "@proconnect-gouv/proconnect.core/security";
import {
  LinkTypes,
  UnverifiedLinkTypes,
} from "@proconnect-gouv/proconnect.identite/types";
import type { Request, RequestHandler } from "express";
import HttpErrors from "http-errors";
import { isEmpty } from "lodash-es";
import { match, P } from "ts-pattern";
import {
  CERTIFICATION_DIRIGEANT_MAX_AGE_IN_MINUTES,
  HOST,
  LOG_LEVEL,
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
  createPendingModeration,
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
  hasValidFranceConnectIdentity,
  needsEmailVerificationRenewal,
} from "../managers/user";
import { getUserOrganizationLink } from "../repositories/organization/getters";
import {
  linkUserToOrganization,
  updateUserOrganizationLink,
} from "../repositories/organization/setters";
import { getSelectedOrganizationId } from "../repositories/redis/selected-organization";
import { getFranceConnectUserInfo } from "../repositories/user";
import { isExpired } from "../services/is-expired";
import { logger } from "../services/log";
import { usesAuthHeaders } from "../services/uses-auth-headers";

//

type RequestContext = { req: Request };

type UserOrganizationsByUserId = Awaited<
  ReturnType<typeof getOrganizationsByUserId>
>;

type Redirect = {
  type: "redirect";
  url: string;
  trace: Pass[];
};
type Send = { type: "send" };

//

class Pass<TContext extends object = object, TCode extends string = string> {
  readonly type = "next" as const;
  constructor(
    public readonly code: TCode,
    public readonly data: TContext,
    public readonly trace: Pass[] = [],
  ) {}

  pass = <TNewCode extends string>(code: TNewCode) => {
    return new Pass(code, this.data, [...this.trace, this]);
  };

  redirect = (url: string): Redirect => {
    return { type: "redirect", url, trace: this.trace };
  };

  send = (): Send => {
    return { type: "send" };
  };

  extends = <TAdditions extends object>(values: TAdditions) => {
    return new Pass(
      this.code,
      { ...this.data, ...values } as TContext & TAdditions,
      this.trace,
    );
  };

  static is_passing(result: GuardResult<string, object>): result is Pass {
    return result.type === "next";
  }
}

type GuardResult<TCode extends string, TData extends object> =
  | Pass<TData, TCode>
  | Redirect
  | Send;

//

function logger_group(...label: any[]) {
  if (["debug", "trace"].includes(LOG_LEVEL)) console.group(...label);
}
function logger_group_end() {
  if (["debug", "trace"].includes(LOG_LEVEL)) console.groupEnd();
}
function createGuardMiddleware(
  fn: (
    context: Pass<RequestContext, "incoming_request">,
  ) => GuardResult<string, object> | Promise<GuardResult<string, object>>,
): RequestHandler {
  return async (req, res, next) => {
    logger_group("👮‍♀️", req.method, req.originalUrl, fn.name);

    const result = await fn(new Pass("incoming_request", { req }));

    const event = match(result)
      .with({ type: "next" }, ({ trace, code }) =>
        [trace.map(({ code }) => code).join("\n -> "), "\n =>", code].join(" "),
      )
      .with({ type: "redirect" }, ({ trace, url }) =>
        [trace.map(({ code }) => code).join("\n -> "), "\n =>", url].join(" "),
      )
      .with({ type: "send" }, () => ["SEND"].join(" "))
      .exhaustive();
    logger.debug(event);
    logger.trace(result);
    logger_group_end();

    return match(result)
      .with({ type: "next" }, () => next())
      .with({ type: "redirect" }, ({ url }) => res.redirect(url))
      .with({ type: "send" }, () => res.send())
      .exhaustive();
  };
}

//

const getReferrerPath = (req: Request) => {
  // If the method is not GET (ex: POST), then the referrer must be taken from
  // the referrer header. This ensures the referrerPath can be redirected to.
  const originPath =
    req.method === "GET" ? getTrustedReferrerPath(req.originalUrl, HOST) : null;
  const referrerPath = getTrustedReferrerPath(req.get("Referrer"), HOST);

  return originPath || referrerPath || undefined;
};

//

const isUserGuard = ({ data: { req }, pass }: Pass<RequestContext>) => {
  if (usesAuthHeaders(req)) {
    throw new HttpErrors.Forbidden(
      "Access denied. The requested resource does not require authentication.",
    );
  }
  return pass("is_user");
};
export const isUserGuardMiddleware = createGuardMiddleware(isUserGuard);

//

// redirect user to start sign-in page if no email is available in session
const emailInSessionGuard = (prev: Pass<RequestContext>) => {
  const context = isUserGuard(prev);
  if (!Pass.is_passing(context)) return context;

  const {
    data: { req },
    pass,
    redirect,
  } = context;
  if (isEmpty(getEmailFromUnauthenticatedSession(req))) {
    return redirect("/users/start-sign-in");
  }
  return pass("email_in_session");
};
export const emailInSessionGuardMiddleware =
  createGuardMiddleware(emailInSessionGuard);

//

// redirect user to inclusionconnect welcome page if needed
const userHasSeenInclusionconnectWelcomePageGuard = (
  prev: Pass<RequestContext>,
) => {
  const context = emailInSessionGuard(prev);
  if (!Pass.is_passing(context)) return context;

  const {
    data: { req },
    pass,
    redirect,
  } = context;
  if (
    getPartialUserFromUnauthenticatedSession(req)
      .needsInclusionconnectWelcomePage
  ) {
    return redirect("/users/inclusionconnect-welcome");
  }
  return pass("user_has_seen_inclusionconnect_welcome_page");
};
export const credentialPromptRequirementsGuardMiddleware =
  createGuardMiddleware(userHasSeenInclusionconnectWelcomePageGuard);

//

// redirect user to login page if no active session is available
const userIsConnectedGuard = (context: Pass<RequestContext>) => {
  const {
    data: { req },
    pass,
    redirect,
    send,
  } = isUserGuard(context);
  if (req.method === "HEAD") {
    // From express documentation:
    // The app.get() function is automatically called for the HTTP HEAD method
    // in addition to the GET method if app.head() was not called for the path
    // before app.get().
    // We return empty response and the headers are sent to the client.
    return send();
  }

  if (!isWithinAuthenticatedSession(req.session)) {
    const referrerPath = getReferrerPath(req);
    if (referrerPath) {
      req.session.referrerPath = referrerPath;
    }
    return redirect("/users/start-sign-in");
  }

  return pass("user_is_connected");
};

export const userIsConnectedGuardMiddleware =
  createGuardMiddleware(userIsConnectedGuard);

//

const userHasConnectedRecentlyGuard = (prev: Pass<RequestContext>) => {
  const context = userIsConnectedGuard(prev);
  if (!Pass.is_passing(context)) return context;
  const {
    data: { req },
    pass,
    redirect,
  } = context;
  const hasLoggedInRecently = hasUserAuthenticatedRecently(req);
  if (!hasLoggedInRecently) {
    req.session.referrerPath = getReferrerPath(req);
    return redirect(`/users/start-sign-in?notification=login_required`);
  }
  return pass("user_has_connected_recently");
};
export const userHasConnectedRecentlyGuardMiddleware = createGuardMiddleware(
  userHasConnectedRecentlyGuard,
);

//

const userIsVerifiedGuard = async (prev: Pass<RequestContext>) => {
  const context = userIsConnectedGuard(prev);
  if (!Pass.is_passing(context)) return context;

  const {
    data: { req },
    pass,
    redirect,
  } = context;
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
    return redirect(`/users/verify-email${notification_param}`);
  }
  return pass("user_is_verified");
};

export const userIsVerifiedGuardMiddleware =
  createGuardMiddleware(userIsVerifiedGuard);

//

const userIsTwoFactorAuthenticatedGuard = async (
  prev: Pass<RequestContext>,
) => {
  const context = await userIsVerifiedGuard(prev);
  if (!Pass.is_passing(context)) return context;
  const {
    data: { req },
    pass,
    redirect,
  } = context;
  const { id: user_id } = getUserFromAuthenticatedSession(req);

  if (
    ((await shouldForce2faForUser(user_id)) ||
      req.session.twoFactorsAuthRequested) &&
    !isWithinTwoFactorAuthenticatedSession(req)
  ) {
    if (await is2FACapable(user_id)) {
      return redirect("/users/2fa-sign-in");
    } else {
      return redirect("/users/double-authentication-choice");
    }
  }

  return pass("user_is_two_factor_authenticated");
};

//

const browserIsTrustedGuard = async (prev: Pass<RequestContext>) => {
  const context = await userIsTwoFactorAuthenticatedGuard(prev);
  if (!Pass.is_passing(context)) return context;

  const {
    data: { req },
    pass,
    redirect,
  } = context;
  const is_browser_trusted = isBrowserTrustedForUser(req);

  if (!is_browser_trusted) {
    return redirect("/users/verify-email?notification=browser_not_trusted");
  }

  return pass("browser_is_trusted");
};
export const browserIsTrustedGuardMiddleware = createGuardMiddleware(
  browserIsTrustedGuard,
);

export const userCanAccessAppGuardMiddleware = browserIsTrustedGuardMiddleware;

//

const userHasLoggedInRecentlyGuard = async (prev: Pass<RequestContext>) => {
  const context = await browserIsTrustedGuard(prev);
  if (!Pass.is_passing(context)) return context;

  const {
    data: { req },
    pass,
    redirect,
  } = context;
  const hasLoggedInRecently = hasUserAuthenticatedRecently(req);

  if (!hasLoggedInRecently) {
    req.session.referrerPath = getReferrerPath(req);
    return redirect(`/users/start-sign-in?notification=login_required`);
  }

  return pass("user_has_logged_in_recently");
};

const userTwoFactorAuthForAdminGuard = async (prev: Pass<RequestContext>) => {
  const context = await userHasLoggedInRecentlyGuard(prev);
  if (!Pass.is_passing(context)) return context;

  const {
    data: { req },
    pass,
    redirect,
  } = context;
  const { id: user_id } = getUserFromAuthenticatedSession(req);

  if (
    (await is2FACapable(user_id)) &&
    !isWithinTwoFactorAuthenticatedSession(req)
  ) {
    req.session.referrerPath = getReferrerPath(req);
    return redirect("/users/2fa-sign-in?notification=2fa_required");
  }

  return pass("user_two_factor_auth_for_admin");
};

export const userCanAccessAdminGuardMiddleware = createGuardMiddleware(
  userTwoFactorAuthForAdminGuard,
);

//

const userHasAtLeastOneOrganizationGuard = async (
  context: Pass<RequestContext>,
) => {
  const {
    data: { req },
    redirect,
  } = context;

  const userOrganizations = await getOrganizationsByUserId(
    getUserFromAuthenticatedSession(req).id,
  );
  if (isEmpty(userOrganizations)) {
    if (req.session.siretHint) {
      return redirect(
        `/users/join-organization?siret_hint=${req.session.siretHint}`,
      );
    } else {
      return redirect("/users/join-organization");
    }
  }

  return context.pass("user_has_at_least_one_organization").extends({
    userOrganizations,
  });
};

export const userHasAtLeastOneOrganizationGuardMiddleware =
  createGuardMiddleware(
    async function userHasAtLeastOneOrganizationGuardMiddleware(prev) {
      let context;

      context = await browserIsTrustedGuard(prev);
      if (!Pass.is_passing(context)) return context;

      return userHasAtLeastOneOrganizationGuard(context);
    },
  );

const userBelongsToHintedOrganizationGuard = async <
  TContext extends RequestContext & {
    userOrganizations: UserOrganizationsByUserId;
  },
>(
  context: Pass<TContext>,
) => {
  const {
    data: { req, userOrganizations },
    pass,
    redirect,
  } = context;
  if (req.session.siretHint) {
    const hintedOrganization = await getOrganizationBySiret(
      req.session.siretHint,
    );
    const userFromAuthenticatedSession = getUserFromAuthenticatedSession(req);

    if (isEmpty(hintedOrganization))
      return redirect(
        `/users/join-organization?siret_hint=${req.session.siretHint}`,
      );

    if (!userOrganizations.some((org) => org.id === hintedOrganization.id)) {
      return redirect(
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

const userHasSelectedAnOrganizationGuard = async <
  TContext extends RequestContext & {
    userOrganizations: UserOrganizationsByUserId;
  },
>(
  context: Pass<TContext>,
) => {
  const {
    data: { req, userOrganizations },
    pass,
    redirect,
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

    return redirect("/users/select-organization");
  }

  return pass("user_has_selected_an_organization").extends({
    selectedOrganizationId,
  });
};
export const userHasSelectedAnOrganizationGuardMiddleware =
  createGuardMiddleware(
    async function userHasSelectedAnOrganizationGuardMiddleware(prev) {
      let context;

      context = await browserIsTrustedGuard(prev);
      if (!Pass.is_passing(context)) return context;

      context = await userHasAtLeastOneOrganizationGuard(context);
      if (!Pass.is_passing(context)) return context;

      context = await userBelongsToHintedOrganizationGuard(context);
      if (!Pass.is_passing(context)) return context;

      return userHasSelectedAnOrganizationGuard(context);
    },
  );

const userHasValidFranceConnectIdentityGuard = async <
  TContext extends RequestContext,
>(
  context: Pass<TContext>,
) => {
  const {
    data: { req },
    pass,
  } = context;
  const { id: user_id } = getUserFromAuthenticatedSession(req);
  const franceconnectUserInfo = await getFranceConnectUserInfo(user_id);
  if (!franceconnectUserInfo)
    return pass("user_has_no_franceconnect_user_info").redirect(
      "/users/franceconnect",
    );

  if (!hasValidFranceConnectIdentity(franceconnectUserInfo))
    return pass("user_needs_renewal_franceconnect_info").redirect(
      "/users/franceconnect",
    );

  return pass("user_has_valid_franceconnect_user_info").extends({
    franceconnectUserInfo,
  });
};

const linkTypeRequiresFranceConnectionGuard = async <
  TContext extends RequestContext,
>(
  prev: Pass<TContext>,
) => {
  const {
    data: { req },
    pass,
  } = prev;

  const { id: user_id } = getUserFromAuthenticatedSession(req);
  const selectedOrganizationId = (await getSelectedOrganizationId(user_id))!;
  const { verification_type: linkType } = (await getUserOrganizationLink(
    selectedOrganizationId,
    user_id,
  ))!;

  const linkTypeIsUnverified = match(linkType)
    .with(...UnverifiedLinkTypes, () => true)
    .otherwise(() => false);
  const linkTypeRequiresFranceConnection =
    linkTypeIsUnverified || linkType === LinkTypes.enum.organization_dirigeant;

  if (!linkTypeRequiresFranceConnection)
    return pass("link_type_does_not_require_france_connection");

  return userHasValidFranceConnectIdentityGuard(prev);
};

const userHasPersonalInformationsGuard = async <
  TContext extends RequestContext,
>(
  context: Pass<TContext>,
) => {
  const {
    data: { req },
    pass,
    redirect,
  } = context;

  const { given_name, family_name } = getUserFromAuthenticatedSession(req);
  if (isEmpty(given_name) || isEmpty(family_name)) {
    return redirect("/users/personal-information");
  }

  return pass("user_has_personal_informations");
};

const userIsCertifiedAsDirigeantGuard = async <
  TContext extends RequestContext & {
    selectedOrganizationId: number;
  },
>(
  prev: Pass<TContext>,
) => {
  const {
    data: { req, selectedOrganizationId: organizationId },
    pass,
  } = prev;

  const { id: user_id } = getUserFromAuthenticatedSession(req);
  const { verification_type: linkType, verified_at: linkVerifiedAt } =
    (await getUserOrganizationLink(organizationId, user_id))!;

  if (
    req.session.certificationDirigeantRequested &&
    linkType !== LinkTypes.enum.organization_dirigeant
  ) {
    const context = await userHasValidFranceConnectIdentityGuard(prev);
    if (!Pass.is_passing(context)) return context;

    req.session.pendingCertificationDirigeantOrganizationId = organizationId;
    return processCertificationDirigeantGuard(context);
  }

  if (linkType === LinkTypes.enum.organization_dirigeant) {
    const context = await userHasValidFranceConnectIdentityGuard(prev);
    if (!Pass.is_passing(context)) return context;

    const {
      data: { franceconnectUserInfo },
      pass,
    } = context;

    const expiredCertification = isExpired(
      linkVerifiedAt,
      CERTIFICATION_DIRIGEANT_MAX_AGE_IN_MINUTES,
    );
    const expiredVerification =
      Number(franceconnectUserInfo.updated_at) > Number(linkVerifiedAt);

    const renewalNeeded = expiredCertification || expiredVerification;
    if (renewalNeeded) {
      req.session.pendingCertificationDirigeantOrganizationId = organizationId;
      return processCertificationDirigeantGuard(context);
    }

    return pass("user_is_certified_as_dirigeant");
  }

  return pass("no_certification_as_dirigeant_needed");
};

const userHasNoPendingOfficialContactEmailVerificationGuard = async (
  context: Pass<RequestContext>,
) => {
  const {
    data: { req },
    pass,
    redirect,
  } = context;

  const userOrganizations = await getOrganizationsByUserId(
    getUserFromAuthenticatedSession(req).id,
  );

  let organizationThatNeedsOfficialContactEmailVerification;

  if (req.session.mustReturnOneOrganizationInPayload) {
    const selectedOrganizationId = await getSelectedOrganizationId(
      getUserFromAuthenticatedSession(req).id,
    );

    organizationThatNeedsOfficialContactEmailVerification =
      userOrganizations.find(
        ({ id, needs_official_contact_email_verification }) =>
          needs_official_contact_email_verification &&
          id === selectedOrganizationId,
      );
  } else {
    organizationThatNeedsOfficialContactEmailVerification =
      userOrganizations.find(
        ({ needs_official_contact_email_verification }) =>
          needs_official_contact_email_verification,
      );
  }

  if (!isEmpty(organizationThatNeedsOfficialContactEmailVerification)) {
    return redirect(
      `/users/official-contact-email-verification/${organizationThatNeedsOfficialContactEmailVerification.id}`,
    );
  }

  return pass("user_has_no_pending_official_contact_email_verification");
};

const userHasBeenGreetedGuard = async (context: Pass<RequestContext>) => {
  const {
    data: { req },
    pass,
    redirect,
  } = context;
  const { id: user_id } = getUserFromAuthenticatedSession(req);

  const userOrganizations = await getOrganizationsByUserId(user_id);

  let organizationThatNeedsGreetings;

  if (req.session.mustReturnOneOrganizationInPayload) {
    const selectedOrganizationId = await getSelectedOrganizationId(user_id);

    organizationThatNeedsGreetings = userOrganizations.find(
      ({ id, has_been_greeted }) =>
        !has_been_greeted && id === selectedOrganizationId,
    );
  } else {
    organizationThatNeedsGreetings = userOrganizations.find(
      ({ has_been_greeted }) => !has_been_greeted,
    );
  }

  if (!isEmpty(organizationThatNeedsGreetings)) {
    if (
      organizationThatNeedsGreetings.verification_type ===
      LinkTypes.enum.organization_dirigeant
    ) {
      await greetForCertification({
        user_id,
        organization_id: organizationThatNeedsGreetings.id,
      });
      return redirect("/users/welcome/dirigeant");
    }

    await greetForJoiningOrganization({
      user_id,
      organization_id: organizationThatNeedsGreetings.id,
    });

    return redirect("/users/welcome");
  }

  return pass("user_has_been_greeted");
};

const connectToAppGuard = async (prev: Pass<RequestContext>) => {
  let context;

  context = await userHasNoPendingOfficialContactEmailVerificationGuard(prev);
  if (!Pass.is_passing(context)) return context;

  context = await userHasBeenGreetedGuard(context);
  if (!Pass.is_passing(context)) return context;

  return context.pass("ok_to_connect_to_app");
};

const connectToSpWithMultipleOrganizationsGuard = async (
  prev: Pass<RequestContext>,
) => {
  let context;

  context = await userHasAtLeastOneOrganizationGuard(prev);
  if (!Pass.is_passing(context)) return context;

  context = await userHasPersonalInformationsGuard(prev);
  if (!Pass.is_passing(context)) return context;

  context =
    await userHasNoPendingOfficialContactEmailVerificationGuard(context);
  if (!Pass.is_passing(context)) return context;

  context = await userHasBeenGreetedGuard(context);
  if (!Pass.is_passing(context)) return context;

  return context.pass("ok_to_connect_to_sp_with_multiple_organizations");
};

const connectToSp = async (
  prev: Pass<RequestContext>,
): Promise<Redirect | Pass<RequestContext>> => {
  let context;

  context = await userHasAtLeastOneOrganizationGuard(prev);
  if (!Pass.is_passing(context)) return context;

  context = await userBelongsToHintedOrganizationGuard(context);
  if (!Pass.is_passing(context)) return context;

  context = await userHasSelectedAnOrganizationGuard(context);
  if (!Pass.is_passing(context)) return context;

  context = await linkTypeRequiresFranceConnectionGuard(context);
  if (!Pass.is_passing(context)) return context;

  context = await userIsCertifiedAsDirigeantGuard(context);
  if (!Pass.is_passing(context)) return context;

  context = await userHasPersonalInformationsGuard(context);
  if (!Pass.is_passing(context)) return context;

  context =
    await userHasNoPendingOfficialContactEmailVerificationGuard(context);
  if (!Pass.is_passing(context)) return context;

  context = await userHasBeenGreetedGuard(context);
  if (!Pass.is_passing(context)) return context;

  return prev.pass("ok_to_connect_to_sp");
};

const processPendingModerationGuard = async (prev: Pass<RequestContext>) => {
  const {
    data: { req },
  } = prev;

  const organization_id = req.session.pendingModerationOrganizationId!;
  const organization = (await getOrganizationById(organization_id))!;
  const user = getUserFromAuthenticatedSession(prev.data.req);

  let context;

  context = await userHasPersonalInformationsGuard(prev);
  if (!Pass.is_passing(context)) return context;

  const { id: moderation_id } = await createPendingModeration({
    user,
    organization,
  });

  req.session.pendingModerationOrganizationId = undefined;

  return context.redirect(
    `/users/unable-to-auto-join-organization?moderation_id=${moderation_id}`,
  );
};

const processCertificationDirigeantGuard = async (
  prev: Pass<RequestContext>,
) => {
  const req = prev.data.req;
  const organizationId =
    req.session.pendingCertificationDirigeantOrganizationId!;

  const context = await userHasValidFranceConnectIdentityGuard(prev);
  if (!Pass.is_passing(context)) return context;

  const {
    data: { franceconnectUserInfo },
    pass,
    redirect,
  } = context;
  const { id: user_id } = getUserFromAuthenticatedSession(req);

  const organization = (await getOrganizationById(organizationId))!;

  try {
    await processCertificationDirigeantOrThrow(
      organization,
      franceconnectUserInfo,
    );

    req.session.pendingCertificationDirigeantOrganizationId = undefined;

    if (await getUserOrganizationLink(organizationId, user_id)) {
      await updateUserOrganizationLink(organization.id, user_id, {
        verification_type: LinkTypes.enum.organization_dirigeant,
        verified_at: new Date(),
        has_been_greeted: false,
      });
    } else {
      await linkUserToOrganization({
        user_id,
        organization_id: organization.id,
        verification_type: LinkTypes.enum.organization_dirigeant,
      });
    }

    await selectOrganization({
      user_id,
      organization_id: organizationId,
    });

    pass("user_passed_certification_dirigeant").extends({
      selectedOrganizationId: organizationId,
    });

    return connectToSp(prev);
  } catch (error) {
    if (error instanceof CertificationDirigeantOrganizationNotCoveredError) {
      return redirect(
        "/users/certification-dirigeant/organization-not-covered-error",
      );
    }

    if (error instanceof CertificationDirigeantCloseMatchError) {
      return redirect(getCertificationDirigeantCloseMatchErrorUrl(error));
    }

    if (error instanceof CertificationDirigeantNoMatchError) {
      return redirect(
        `/users/certification-dirigeant/no-match-error?siren=${error.siren}`,
      );
    }

    throw error;
  }
};

// check that the user goes through all requirements before issuing a session
export const userSignInRequirementsGuardMiddleware = createGuardMiddleware(
  async function userSignInRequirementsGuard(prev) {
    const context = await browserIsTrustedGuard(prev);
    if (!Pass.is_passing(context)) return context;

    const {
      pendingModerationOrganizationId,
      interactionId,
      pendingCertificationDirigeantOrganizationId,
      mustReturnOneOrganizationInPayload,
    } = context.data.req.session;

    return match({
      pendingModerationOrganizationId,
      interactionId,
      pendingCertificationDirigeantOrganizationId,
      mustReturnOneOrganizationInPayload,
    })
      .with({ pendingModerationOrganizationId: P.number }, () =>
        processPendingModerationGuard(context),
      )
      .with({ interactionId: P.nullish }, () => connectToAppGuard(context))
      .with({ pendingCertificationDirigeantOrganizationId: P.number }, () => {
        return processCertificationDirigeantGuard(context);
      })
      .with(
        { mustReturnOneOrganizationInPayload: P.nullish },
        { mustReturnOneOrganizationInPayload: false },
        () => connectToSpWithMultipleOrganizationsGuard(context),
      )
      .otherwise(() => connectToSp(context));
  },
);
