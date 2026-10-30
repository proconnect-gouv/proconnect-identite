import { LinkEnum } from "@proconnect-gouv/proconnect.identite/types";
import HttpErrors from "http-errors";
import isEmpty from "lodash-es/isEmpty";
import { match } from "ts-pattern";
import {
  CertificationDirigeantCloseMatchError,
  CertificationDirigeantNoMatchError,
  CertificationDirigeantOrganizationNotCoveredError,
} from "../../config/errors";
import { context, runtime } from "../../connectors/context";
import {
  getCertificationDirigeantCloseMatchErrorUrl,
  processCertificationDirigeantOrThrow,
} from "../../managers/certification";
import {
  createPendingModeration,
  greetForJoiningOrganization,
} from "../../managers/organization/join";
import { selectOrganization } from "../../managers/organization/main";
import { isCommuneWithMultipleOfficialContactEmails } from "../../managers/organization/official-contact-email-verification";
import {
  deleteSelectedOrganizationIdFromAuthenticatedSession,
  getSelectedOrganizationIdFromAuthenticatedSession,
  getUserFromAuthenticatedSession,
} from "../../managers/session/authenticated";
import { hasValidFranceConnectIdentity } from "../../managers/user";
import { track } from "../../services/log";
import { userHasPersonalInformationsGuard } from "./guards";
import { Pass, type RequestContext } from "./internals";
import {
  userCanConnectToSpGuard,
  userComplyWithAllRequirementsGuard,
} from "./meta";

const { franceconnect_userinfo, organizations, users_organizations } =
  context.repository;

export const processPendingModerationGuard = async (
  prev: Pass<RequestContext>,
) => {
  const {
    data: { req },
  } = prev;

  const organization_id = req.session.pendingModerationOrganizationId!;
  const organization = await organizations.getById(organization_id);
  const user = getUserFromAuthenticatedSession(prev.data.req);

  let context;

  context = await userHasPersonalInformationsGuard(prev);
  if (!Pass.is_passing(context)) return context;

  const { id: moderation_id } = await createPendingModeration({
    organization,
    sp_name: req.session.spName,
    user,
  });

  req.session.pendingModerationOrganizationId = undefined;

  return context.continueTo(
    `/users/unable-to-auto-join-organization?moderation_id=${moderation_id}`,
  );
};

export const processPendingCertificationDirigeantGuard = async (
  prev: Pass<RequestContext>,
) => {
  const {
    data: { req },
    pass,
    haltTo,
    continueTo,
  } = prev;

  const organization_id =
    req.session.pendingCertificationDirigeantOrganizationId!;

  const { id: user_id } = getUserFromAuthenticatedSession(req);
  if (!(await hasValidFranceConnectIdentity(user_id))) {
    return haltTo("/users/franceconnect");
  }

  const franceconnectUserInfo = (await franceconnect_userinfo.find(user_id))!;
  const organization = await organizations.getById(organization_id);

  try {
    await processCertificationDirigeantOrThrow(
      organization,
      franceconnectUserInfo,
    );

    req.session.pendingCertificationDirigeantOrganizationId = undefined;

    const membership = await runtime
      .as({ type: "user", user_id })
      .addMembership({
        user_id,
        organization_id: organization.id,
        verification_type: LinkEnum.enum.organization_dirigeant,
      });

    const outcome =
      membership.kind === "member_already_exists"
        ? await runtime.as({ type: "user", user_id }).updateMembership({
            organization_id,
            renew_verification: true,
            user_id,
            verification_type: LinkEnum.enum.organization_dirigeant,
          })
        : membership;

    match(outcome)
      .with({ kind: "member_joined" }, ({ activity_id }) =>
        track("certification_dirigeant.member.joined", {
          activity_id,
          organization_id,
          user_id,
        }),
      )
      .with({ kind: "member_updated" }, ({ activity_id, previous }) =>
        track("certification_dirigeant.member.updated", {
          activity_id,
          organization_id,
          previous_verification_type: previous.verification_type,
          user_id,
          verification_type: LinkEnum.enum.organization_dirigeant,
        }),
      )
      .with({ kind: "membership_unchanged" }, () =>
        track("certification_dirigeant.member.unchanged", {
          organization_id,
          user_id,
        }),
      )
      .with({ kind: "membership_not_found" }, () =>
        track("certification_dirigeant.membership.not_found", {
          organization_id,
          user_id,
        }),
      )
      .exhaustive();

    await selectOrganization({ req, organization_id });

    req.session.pendingGreetingsForSelectedOrganization = true;

    pass("process_certification_dirigeant").extends({
      selectedOrganizationId: organization_id,
    });

    return userComplyWithAllRequirementsGuard(prev);
  } catch (error) {
    req.session.pendingCertificationDirigeantOrganizationId = undefined;
    deleteSelectedOrganizationIdFromAuthenticatedSession(req);

    if (error instanceof CertificationDirigeantOrganizationNotCoveredError) {
      return continueTo(
        "/users/certification-dirigeant/organization-not-covered-error",
      );
    }

    if (error instanceof CertificationDirigeantCloseMatchError) {
      return continueTo(getCertificationDirigeantCloseMatchErrorUrl(error));
    }

    if (error instanceof CertificationDirigeantNoMatchError) {
      return continueTo(
        `/users/certification-dirigeant/no-match-error?siren=${error.siren}&organization_label=${encodeURIComponent(error.organization_label)}`,
      );
    }

    throw error;
  }
};

export const processOfficialContactEmailVerificationGuard = async (
  prev: Pass<RequestContext>,
) => {
  const {
    data: { req },
    continueTo,
  } = prev;
  const organization_id =
    req.session.pendingOfficialContactEmailVerificationOrganizationId!;
  const organization = await organizations.getById(organization_id);
  if (isEmpty(organization)) {
    throw HttpErrors.NotFound();
  }

  if (await isCommuneWithMultipleOfficialContactEmails(organization)) {
    return continueTo(`/users/official-contact-ask-which-email`);
  }

  return continueTo(`/users/official-contact-email-verification`);
};

export const processGreetingsForSelectedOrganizationGuard = async (
  prev: Pass<RequestContext>,
) => {
  const {
    data: { req },
  } = prev;

  let context;

  context = await userCanConnectToSpGuard(prev);
  if (!Pass.is_passing(context)) return context;

  const { pendingGreetingsForSelectedOrganization } = req.session;
  const user_id = getUserFromAuthenticatedSession(req).id;
  const organization_id =
    getSelectedOrganizationIdFromAuthenticatedSession(req);

  if (!pendingGreetingsForSelectedOrganization || !organization_id) {
    throw HttpErrors.InternalServerError();
  }
  // ASSERT link exists
  const link = await users_organizations.get({ user_id, organization_id });

  if (link.verification_type !== LinkEnum.enum.organization_dirigeant) {
    await greetForJoiningOrganization({ user_id, organization_id });
  }

  req.session.pendingGreetingsForSelectedOrganization = undefined;

  return context.continueTo("/users/welcome");
};
