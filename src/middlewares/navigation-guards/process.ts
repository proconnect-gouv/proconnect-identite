import { LinkEnum } from "@proconnect-gouv/proconnect.identite/types";
import HttpErrors from "http-errors";
import isEmpty from "lodash-es/isEmpty";
import {
  CertificationDirigeantCloseMatchError,
  CertificationDirigeantNoMatchError,
  CertificationDirigeantOrganizationNotCoveredError,
} from "../../config/errors";
import { context } from "../../connectors/context";
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
import { getUserFromAuthenticatedSession } from "../../managers/session/authenticated";
import { hasValidFranceConnectIdentity } from "../../managers/user";
import {
  deleteSelectedOrganizationId,
  getSelectedOrganizationId,
} from "../../repositories/redis/selected-organization";
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

export const process = async (prev: Pass<RequestContext>) => {
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

    if (await users_organizations.find({ organization_id, user_id })) {
      await users_organizations.update(
        { organization_id, user_id },
        {
          verification_type: LinkEnum.enum.organization_dirigeant,
          verified_at: new Date(),
          has_been_greeted: false,
        },
      );
    } else {
      await users_organizations.create({
        user_id,
        organization_id: organization.id,
        verification_type: LinkEnum.enum.organization_dirigeant,
      });
    }

    await selectOrganization({
      user_id,
      organization_id,
    });

    req.session.pendingGreetingsForSelectedOrganization = true;

    pass("process_certification_dirigeant").extends({
      selectedOrganizationId: organization_id,
    });

    return userComplyWithAllRequirementsGuard(prev);
  } catch (error) {
    req.session.pendingCertificationDirigeantOrganizationId = undefined;
    await deleteSelectedOrganizationId(user_id);

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
  const organization_id = await getSelectedOrganizationId(user_id);

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
