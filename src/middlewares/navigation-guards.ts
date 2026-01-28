import { getTrustedReferrerPath } from "@proconnect-gouv/proconnect.core/security";
import {
  LinkTypes,
  UnverifiedLinkTypes,
  type Organization,
  type User,
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
  isUserVerifiedWithFranceconnect,
  needsEmailVerificationRenewal,
} from "../managers/user";
import { getUserOrganizationLink } from "../repositories/organization/getters";
import {
  linkUserToOrganization,
  updateUserOrganizationLink,
} from "../repositories/organization/setters";
import { getSelectedOrganizationId } from "../repositories/redis/selected-organization";
import { getFranceConnectUserInfo } from "../repositories/user";
import { addQueryParameters } from "../services/add-query-parameters";
import { isExpired } from "../services/is-expired";
import { logger } from "../services/log";
import { usesAuthHeaders } from "../services/uses-auth-headers";

//
type RequestContext = { req: Request };
type PendingModeration = { pendingModerationOrganizationId: number };
type PendingCertificationDirigeant = {
  pendingCertificationDirigeantOrganizationId: number;
};

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
    if (result.type === "next")
      logger.debug(
        result.trace.map(({ code }) => code).join("\n -> "),
        "\n => ",
        result.code,
      );
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

const checkIsUser = ({ data: { req }, pass }: Pass<RequestContext>) => {
  if (usesAuthHeaders(req)) {
    throw new HttpErrors.Forbidden(
      "Access denied. The requested resource does not require authentication.",
    );
  }
  return pass("is_user");
};
export const requireIsUser = createGuardMiddleware(checkIsUser);

//

// redirect user to start sign-in page if no email is available in session
const checkEmailInSession = (prev: Pass<RequestContext>) => {
  const context = checkIsUser(prev);
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
export const requireEmailInSession = createGuardMiddleware(checkEmailInSession);

//

// redirect user to inclusionconnect welcome page if needed
const checkUserHasSeenInclusionconnectWelcomePage = (
  prev: Pass<RequestContext>,
) => {
  const context = checkEmailInSession(prev);
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
export const requireCredentialPromptRequirements = createGuardMiddleware(
  checkUserHasSeenInclusionconnectWelcomePage,
);

//

// redirect user to login page if no active session is available
const checkUserIsConnected = (context: Pass<RequestContext>) => {
  const {
    data: { req },
    pass,
    redirect,
    send,
  } = checkIsUser(context);
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

export const requireUserIsConnected =
  createGuardMiddleware(checkUserIsConnected);

//

const checkUserHasConnectedRecently = (prev: Pass<RequestContext>) => {
  const context = checkUserIsConnected(prev);
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
export const requireUserHasConnectedRecently = createGuardMiddleware(
  checkUserHasConnectedRecently,
);

//

const checkUserIsVerified = async (prev: Pass<RequestContext>) => {
  const context = checkUserIsConnected(prev);
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

export const requireUserIsVerified = createGuardMiddleware(checkUserIsVerified);

//

const checkUserTwoFactorAuth = async (prev: Pass<RequestContext>) => {
  const context = await checkUserIsVerified(prev);
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

  return pass("user_maybe_two_factor_auth");
};

//

const checkBrowserIsTrusted = async (prev: Pass<RequestContext>) => {
  const context = await checkUserTwoFactorAuth(prev);
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
export const requireBrowserIsTrusted = createGuardMiddleware(
  checkBrowserIsTrusted,
);

export const requireUserCanAccessApp = requireBrowserIsTrusted;

//

const checkUserHasLoggedInRecently = async (prev: Pass<RequestContext>) => {
  const context = await checkBrowserIsTrusted(prev);
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

const checkUserTwoFactorAuthForAdmin = async (prev: Pass<RequestContext>) => {
  const context = await checkUserHasLoggedInRecently(prev);
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

export const requireUserCanAccessAdmin = createGuardMiddleware(
  checkUserTwoFactorAuthForAdmin,
);

//

const checkUserHasAtLeastOneOrganization = async (
  context: Pass<RequestContext>,
) => {
  const {
    data: { req },
  } = context;

  const userOrganizations = await getOrganizationsByUserId(
    getUserFromAuthenticatedSession(req).id,
  );
  if (isEmpty(userOrganizations)) {
    return context.redirect(
      addQueryParameters("/users/join-organization", {
        siret_hint: req.session.siretHint,
      }),
    );
  }

  return context.pass("user_has_at_least_one_organization").extends({
    userOrganizations,
  });
};

export const requireUserHasAtLeastOneOrganization = createGuardMiddleware(
  async function requireUserHasAtLeastOneOrganization(prev) {
    let context;

    context = await checkBrowserIsTrusted(prev);
    if (!Pass.is_passing(context)) return context;

    return checkUserHasAtLeastOneOrganization(context);
  },
);

const checkUserBelongsToHintedOrganization = async <
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
  if (!req.session.siretHint) {
    return pass("no_siret_hint");
  }
  const hintedOrganization = await getOrganizationBySiret(
    req.session.siretHint,
  );

  const userFromAuthenticatedSession = getUserFromAuthenticatedSession(req);

  if (
    !isEmpty(hintedOrganization) &&
    userOrganizations.some((org) => org.id === hintedOrganization.id)
  ) {
    await selectOrganization({
      user_id: userFromAuthenticatedSession.id,
      organization_id: hintedOrganization.id,
    });
    return pass("user_belongs_to_hinted_organization");
  }

  return redirect(
    addQueryParameters("/users/join-organization", {
      siret_hint: req.session.siretHint,
    }),
  );
};

const checkUserHasSelectedAnOrganization = async <
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

  if (selectedOrganizationId)
    return pass("user_has_selected_an_organization").extends({
      selectedOrganizationId,
    });

  if (
    userOrganizations.length === 1 &&
    !req.session.certificationDirigeantRequested
  ) {
    await selectOrganization({
      user_id: getUserFromAuthenticatedSession(req).id,
      organization_id: userOrganizations[0].id,
    });
    return pass("auto_selection_of_user_only_organization").extends({
      selectedOrganizationId: userOrganizations[0].id,
    });
  }

  return redirect("/users/select-organization");
};
export const requireUserHasSelectedAnOrganization = createGuardMiddleware(
  async function requireUserHasSelectedAnOrganization(prev) {
    let context;

    context = await checkBrowserIsTrusted(prev);
    if (!Pass.is_passing(context)) return context;
    context = await checkUserHasAtLeastOneOrganization(context);
    if (!Pass.is_passing(context)) return context;

    return checkUserHasSelectedAnOrganization(context);
  },
);

const checkFranceConnectForCertificationDirigeant = async <
  TContext extends RequestContext & { selectedOrganizationId: number },
>(
  context: Pass<TContext>,
) => {
  const {
    data: { req, selectedOrganizationId },
    pass,
  } = context;

  if (req.session.pendingCertificationDirigeantOrganizationId) {
    return pass("pending_certification_dirigeant");
  }

  if (!req.session.certificationDirigeantRequested) {
    return pass("no_certification_dirigeant_requested");
  }

  const { id: user_id } = getUserFromAuthenticatedSession(req);
  const linkType = await getUserOrganizationLink(
    selectedOrganizationId,
    user_id,
  );

  if (linkType?.verification_type !== LinkTypes.enum.organization_dirigeant) {
    req.session.pendingCertificationDirigeantOrganizationId =
      selectedOrganizationId;
  }

  return pass("certification_dirigeant_setup");
};

export const requireFranceConnectForCertificationDirigeant =
  createGuardMiddleware(
    async function requireFranceConnectForCertificationDirigeant(prev) {
      let context;
      context = await checkBrowserIsTrusted(prev);
      if (!Pass.is_passing(context)) return context;

      const { req } = context.data;
      if (req.session.pendingCertificationDirigeantOrganizationId) {
        return context.pass("pending_certification_dirigeant");
      }

      context = await checkUserHasAtLeastOneOrganization(context);
      if (!Pass.is_passing(context)) return context;
      context = await checkUserHasSelectedAnOrganization(context);
      if (!Pass.is_passing(context)) return context;
      return checkFranceConnectForCertificationDirigeant(context);
    },
  );

const checkUserIsFranceConnected = async <TContext extends RequestContext>(
  context: Pass<TContext>,
) => {
  const {
    data: { req },
    pass,
    redirect,
  } = context;

  const { id: user_id } = getUserFromAuthenticatedSession(req);

  if (!req.session.pendingCertificationDirigeantOrganizationId) {
    const selectedOrganizationId = (await getSelectedOrganizationId(user_id))!;
    const { verification_type: linkType } = (await getUserOrganizationLink(
      selectedOrganizationId,
      user_id,
    ))!;

    const linkTypeIsUnverified = match(linkType)
      .with(...UnverifiedLinkTypes, () => true)
      .otherwise(() => false);
    if (
      linkType !== LinkTypes.enum.organization_dirigeant &&
      !linkTypeIsUnverified
    )
      return pass("user_not_requesting_dirigeant_certification");
  }

  const isVerified = await isUserVerifiedWithFranceconnect(user_id);
  if (isVerified) return pass("user_franceconnect_verified");

  return redirect("/users/franceconnect");
};

const checkUserHasPersonalInformations = async (
  context: Pass<RequestContext>,
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

  return pass("personal_informations");
};

const checkModerationCreated = async (
  context: Pass<{
    organization: Organization;
    user: User;
  }>,
) => {
  const {
    data: { organization, user },

    redirect,
  } = context;

  const { id: moderation_id } = await createPendingModeration({
    user,
    organization,
  });

  return redirect(
    `/users/unable-to-auto-join-organization?moderation_id=${moderation_id}`,
  );
};

const checkCertificationDirigeantNotExpired = async <
  TContext extends RequestContext & { selectedOrganizationId: number },
>(
  context: Pass<TContext>,
) => {
  const {
    data: { req, selectedOrganizationId: organizationId },
    pass,
  } = context;

  if (req.session.pendingCertificationDirigeantOrganizationId) {
    return pass("pending_certification_dirigeant");
  }

  const { id: user_id } = getUserFromAuthenticatedSession(req);
  const franceconnectUserInfo = (await getFranceConnectUserInfo(user_id))!;
  const { verification_type: linkType, verified_at: linkVerifiedAt } =
    (await getUserOrganizationLink(organizationId, user_id))!;

  if (linkType !== LinkTypes.enum.organization_dirigeant)
    return pass("not_dirigeant_link");

  const expiredCertification = isExpired(
    linkVerifiedAt,
    CERTIFICATION_DIRIGEANT_MAX_AGE_IN_MINUTES,
  );
  const expiredVerification =
    Number(franceconnectUserInfo.updated_at) > Number(linkVerifiedAt);

  const renewalNeeded = expiredCertification || expiredVerification;

  if (renewalNeeded)
    req.session.pendingCertificationDirigeantOrganizationId = organizationId;

  return pass("certification_dirigeant_not_expired");
};

const checkUserPassedCertificationDirigeant = async (
  context: Pass<
    RequestContext & { pendingCertificationDirigeantOrganizationId: number }
  >,
) => {
  const {
    data: { req, pendingCertificationDirigeantOrganizationId: organizationId },
    pass,
    redirect,
  } = context;

  const { id: user_id } = getUserFromAuthenticatedSession(req);
  const franceconnectUserInfo = (await getFranceConnectUserInfo(user_id))!;
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

    return pass("certification_dirigeant_processed").extends({
      selectedOrganizationId: organizationId,
    });
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

const checkUserHasNoPendingOfficialContactEmailVerification = async (
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

  return pass("no_pending_official_contact_email_verification");
};

const checkUserHasBeenGreetedForJoiningOrganization = async (
  context: Pass<RequestContext>,
) => {
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

  if (isEmpty(organizationThatNeedsGreetings)) {
    return pass("user_has_been_greeted");
  }

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
};

const handlePendingModerationFlow = async (
  prev: Pass<RequestContext & PendingModeration>,
) => {
  const { pendingModerationOrganizationId: organization_id } =
    prev.data.req.session;
  if (!organization_id) return prev.pass("no_moderation_to_create");

  const organization = await getOrganizationById(organization_id);
  if (!organization) {
    prev.data.req.session.pendingModerationOrganizationId = undefined;
    return prev
      .pass("moderation_to_create_on_non_existing_organization")
      .redirect(`/users/join-organization?notification=invalid_siret`);
  }
  const user = getUserFromAuthenticatedSession(prev.data.req);

  //

  let context;

  context = await checkUserHasPersonalInformations(prev);

  if (!Pass.is_passing(context)) return context;
  const { req } = context.data;
  context = await checkModerationCreated(
    new Pass(context.code, {
      organization,
      user,
    }),
  );
  req.session.pendingModerationOrganizationId = undefined;
  if (!Pass.is_passing(context)) return context;

  return context;
};

const handleAppDirectFlow = async (prev: Pass<RequestContext>) => {
  let context;

  context = await checkUserHasNoPendingOfficialContactEmailVerification(prev);
  if (!Pass.is_passing(context)) return context;

  context = await checkUserHasBeenGreetedForJoiningOrganization(context);
  if (!Pass.is_passing(context)) return context;

  return context.pass("app_direct_flow");
};

const handlePendingCertificationFlow = async (
  prev: Pass<RequestContext & PendingCertificationDirigeant>,
) => {
  let context;

  context = await checkUserIsFranceConnected(prev);
  if (!Pass.is_passing(context)) return context;

  context = await checkUserPassedCertificationDirigeant(context);
  if (!Pass.is_passing(context)) return context;

  context = await checkUserHasBeenGreetedForJoiningOrganization(context);
  if (!Pass.is_passing(context)) return context;

  return context.pass("certification_dirigeant_complete");
};

const handleOidcWithoutOrgFlow = async (prev: Pass<RequestContext>) => {
  const context = await checkUserHasAtLeastOneOrganization(prev);
  if (!Pass.is_passing(context)) return context;

  return context.pass("no_org_in_payload_required");
};

const handleOidcWithOrgFlow = async (prev: Pass<RequestContext>) => {
  let context;

  context = await checkUserHasAtLeastOneOrganization(prev);
  if (!Pass.is_passing(context)) return context;

  context = await checkUserBelongsToHintedOrganization(context);
  if (!Pass.is_passing(context)) return context;

  context = await checkUserHasSelectedAnOrganization(context);
  if (!Pass.is_passing(context)) return context;

  context = await checkFranceConnectForCertificationDirigeant(context);
  context = await checkCertificationDirigeantNotExpired(context);
  context = await checkUserIsFranceConnected(context);
  if (!Pass.is_passing(context)) return context;

  const { req } = context.data;
  if (req.session.pendingCertificationDirigeantOrganizationId) {
    const pendingOrgId =
      req.session.pendingCertificationDirigeantOrganizationId;

    context = await checkUserPassedCertificationDirigeant(
      context.extends({
        pendingCertificationDirigeantOrganizationId: pendingOrgId,
      }),
    );
    if (!Pass.is_passing(context)) return context;
  }

  context =
    await checkUserHasNoPendingOfficialContactEmailVerification(context);
  if (!Pass.is_passing(context)) return context;

  context = await checkUserHasBeenGreetedForJoiningOrganization(context);
  if (!Pass.is_passing(context)) return context;

  return context.pass("user_sign_in_requirements_met");
};

// check that the user goes through all requirements before issuing a session
export const requireUserSignInRequirements = createGuardMiddleware(
  async function requireUserSignInRequirements(prev) {
    const context = await checkBrowserIsTrusted(prev);
    if (!Pass.is_passing(context)) return context;

    const { req } = context.data;
    const { session } = req;

    return match({
      pendingModerationOrganizationId: session.pendingModerationOrganizationId,
      interactionId: session.interactionId,
      pendingCertificationDirigeantOrganizationId:
        session.pendingCertificationDirigeantOrganizationId,
      mustReturnOneOrganizationInPayload:
        session.mustReturnOneOrganizationInPayload,
    })
      .with(
        { pendingModerationOrganizationId: P.number },
        ({ pendingModerationOrganizationId }) =>
          handlePendingModerationFlow(
            context.extends({ pendingModerationOrganizationId }),
          ),
      )
      .with({ interactionId: P.nullish }, () => handleAppDirectFlow(context))
      .with(
        { pendingCertificationDirigeantOrganizationId: P.number },
        ({ pendingCertificationDirigeantOrganizationId }) =>
          handlePendingCertificationFlow(
            context.extends({ pendingCertificationDirigeantOrganizationId }),
          ),
      )
      .with(
        { mustReturnOneOrganizationInPayload: P.nullish },
        { mustReturnOneOrganizationInPayload: false },
        () => handleOidcWithoutOrgFlow(context),
      )
      .otherwise(() => handleOidcWithOrgFlow(context));
  },
);
