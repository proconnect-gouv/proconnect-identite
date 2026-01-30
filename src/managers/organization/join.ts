import { ApiEntrepriseError } from "@proconnect-gouv/proconnect.api_entreprise/types";
import { isEmailValid } from "@proconnect-gouv/proconnect.core/security";
import { getEmailDomain } from "@proconnect-gouv/proconnect.core/services/email";
import { Welcome } from "@proconnect-gouv/proconnect.email";
import {
  InvalidSiretError,
  OrganizationNotFoundError,
} from "@proconnect-gouv/proconnect.identite/errors";
import {
  forceJoinOrganizationFactory,
  joinOrganization as joinOrganizationDecision,
  type JoinContext,
  type JoinErrorReason,
} from "@proconnect-gouv/proconnect.identite/managers/organization";
import {
  isArmeeDomain,
  isCommune,
  isEducationNationaleDomain,
  isEtablissementScolaireDuPremierEtSecondDegre,
} from "@proconnect-gouv/proconnect.identite/services/organization";
import {
  ModerationTypeSchema,
  type Organization,
  type User,
  type UserOrganizationLink,
} from "@proconnect-gouv/proconnect.identite/types";
import * as Sentry from "@sentry/node";
import { isEmpty, some } from "lodash-es";
import { AssertionError } from "node:assert";
import { inspect } from "node:util";
import { match } from "ts-pattern";
import {
  CRISP_WEBSITE_ID,
  FEATURE_BYPASS_MODERATION,
  HOST,
  MAX_SUGGESTED_ORGANIZATIONS,
} from "../../config/env";
import {
  AccessRestrictedToPublicServiceEmailError,
  DomainNotAllowedForOrganizationError,
  DomainRefusedForOrganizationError,
  GouvFrDomainsForbiddenForPrivateOrg,
  OrganizationNotActiveError,
  PendingCertificationDirigeantError,
  UnableToAutoJoinOrganizationError,
  UserAlreadyAskedToJoinOrganizationError,
  UserInOrganizationAlreadyError,
  UserModerationRejectedError,
  UserMustConfirmToJoinOrganizationError,
} from "../../config/errors";
import { getAnnuaireEducationNationaleContactEmail } from "../../connectors/api-annuaire-education-nationale";
import { getAnnuaireServicePublicContactEmail } from "../../connectors/api-annuaire-service-public";
import { getOrganizationInfo } from "../../connectors/api-sirene";
import { startCripsConversation } from "../../connectors/crisp";
import { sendMail } from "../../connectors/mail";
import { findEmailDomainsByOrganizationId } from "../../repositories/email-domain";
import {
  createModeration,
  findPendingModeration,
  findRejectedModeration,
} from "../../repositories/moderation";
import {
  findBySiret,
  findByUserId,
  findByVerifiedEmailDomain,
  getById,
} from "../../repositories/organization/getters";
import {
  linkUserToOrganization,
  updateUserOrganizationLink,
  upsert,
} from "../../repositories/organization/setters";
import { getById as getUserById } from "../../repositories/user";
import {
  isAFreeEmailProvider,
  usesAFreeEmailProvider,
} from "../../services/email";
import { logger } from "../../services/log";
import { unableToAutoJoinOrganizationMd } from "../../views/mails/unable-to-auto-join-organization";
import { getOrganizationsByUserId, markDomainAsVerified } from "./main";

export const doSuggestOrganizations = async ({
  user_id,
  email,
}: {
  user_id: number;
  email: string;
}): Promise<boolean> => {
  const suggestedOrganizations = await getOrganizationSuggestions({
    user_id,
    email,
  });
  return suggestedOrganizations.length > 0;
};

export const getOrganizationSuggestions = async ({
  user_id,
  email,
}: {
  user_id: number;
  email: string;
}): Promise<Organization[]> => {
  if (usesAFreeEmailProvider(email)) {
    return [];
  }
  const userOrganizations = await findByUserId(user_id);
  if (!isEmpty(userOrganizations)) {
    return [];
  }

  const domain = getEmailDomain(email);

  if (isEducationNationaleDomain(domain)) {
    return [];
  }

  if (isArmeeDomain(domain)) {
    const armeeOrganization = await findBySiret("11009001600053");
    if (armeeOrganization) {
      return [armeeOrganization];
    }
  }

  const organizationsSuggestions = await findByVerifiedEmailDomain(domain);

  if (organizationsSuggestions.length > MAX_SUGGESTED_ORGANIZATIONS) {
    return [];
  }

  const userOrganizationsIds = userOrganizations.map(({ id }) => id);

  return organizationsSuggestions.filter(
    ({ id }) => !userOrganizationsIds.includes(id),
  );
};

export const upsertOrganization = async (siret: string) => {
  let organization: Organization;
  try {
    const organizationInfo = await getOrganizationInfo(siret);
    organization = await upsert({
      siret,
      organizationInfo,
    });
  } catch (error) {
    if (error instanceof ApiEntrepriseError) {
      throw error;
    }

    throw new InvalidSiretError("", { cause: error });
  }

  return organization;
};

async function fetchContactEmail(
  organization: Organization,
): Promise<string | null> {
  const isSchool = isEtablissementScolaireDuPremierEtSecondDegre(organization);
  const isCommuneNotSchool = isCommune(organization) && !isSchool;

  if (isCommuneNotSchool) {
    try {
      return await getAnnuaireServicePublicContactEmail(
        organization.cached_code_officiel_geographique,
        organization.cached_code_postal,
      );
    } catch (err) {
      logger.error(inspect(err, { depth: 3 }));
      Sentry.captureException(err);
      return null;
    }
  }

  if (isSchool) {
    try {
      return await getAnnuaireEducationNationaleContactEmail(
        organization.siret,
      );
    } catch (err) {
      logger.error(err);
      Sentry.captureException(err);
      return null;
    }
  }

  return null;
}

function throwJoinError(
  reason: JoinErrorReason,
  organization_id: number,
): never {
  switch (reason) {
    case "domain_not_allowed":
      throw new DomainNotAllowedForOrganizationError(organization_id);
    case "domain_refused":
      throw new DomainRefusedForOrganizationError(organization_id);
    case "gouv_fr_domain_forbidden_for_private_org":
      throw new GouvFrDomainsForbiddenForPrivateOrg();
    case "organization_not_active":
      throw new OrganizationNotActiveError();
    case "public_service_requires_professional_email":
      throw new AccessRestrictedToPublicServiceEmailError();
  }
}

export const joinOrganization = async ({
  organization,
  user_id,
  confirmed = false,
  certificationRequested = false,
}: {
  organization: Organization;
  user_id: number;
  confirmed: boolean;
  certificationRequested?: boolean;
}): Promise<UserOrganizationLink> => {
  const { id: organization_id } = organization;

  const user = await getUserById(user_id);
  const { email } = user;
  const domain = getEmailDomain(email);

  const usersOrganizations = await findByUserId(user_id);
  if (some(usersOrganizations, ["id", organization.id])) {
    throw new UserInOrganizationAlreadyError();
  }

  const pendingModeration = await findPendingModeration({
    user_id,
    organization_id: organization.id,
    type: ModerationTypeSchema.enum.organization_join_block,
  });
  if (!isEmpty(pendingModeration)) {
    const { id: moderation_id } = pendingModeration;
    throw new UserAlreadyAskedToJoinOrganizationError(moderation_id, {
      cause: new AssertionError({
        expected: undefined,
        actual: pendingModeration,
        operator: "findPendingModeration",
      }),
    });
  }

  const rejectedModeration = await findRejectedModeration({
    user_id,
    organization_id: organization.id,
    type: ModerationTypeSchema.enum.organization_join_block,
  });
  if (!isEmpty(rejectedModeration)) {
    const { id: moderation_id } = rejectedModeration;
    throw new UserModerationRejectedError(moderation_id, {
      cause: new AssertionError({
        expected: undefined,
        actual: rejectedModeration,
        operator: "findRejectedModeration",
      }),
    });
  }

  if (certificationRequested) {
    throw new PendingCertificationDirigeantError(organization_id);
  }

  const organizationEmailDomains =
    await findEmailDomainsByOrganizationId(organization_id);
  const contactEmail = await fetchContactEmail(organization);
  const contactDomain = contactEmail ? getEmailDomain(contactEmail) : null;

  const context: JoinContext = {
    contactEmail,
    domain,
    featureBypassModeration: FEATURE_BYPASS_MODERATION,
    isContactDomainFree: contactDomain
      ? isAFreeEmailProvider(contactDomain)
      : true,
    isContactEmailSameDomain: contactDomain === domain,
    isContactEmailValid: isEmailValid(contactEmail),
    isFreeEmailProvider: isAFreeEmailProvider(domain),
    organization,
    organizationEmailDomains,
    userEmail: email,
    userHasConfirmed: confirmed,
  };

  const decision = joinOrganizationDecision(context);

  return match(decision)
    .with({ type: "error" }, ({ reason }) => {
      throwJoinError(reason, organization_id);
    })
    .with({ type: "link" }, async (d) => {
      if (d.should_mark_contact_domain_verified && contactDomain) {
        await markDomainAsVerified({
          organization_id,
          domain: contactDomain,
          domain_verification_type: "official_contact",
        });
      }

      return linkUserToOrganization({
        organization_id,
        user_id,
        verification_type:
          d.verification_type as UserOrganizationLink["verification_type"],
        is_external: d.is_external,
        needs_official_contact_email_verification:
          d.needs_official_contact_email_verification,
      });
    })
    .with({ type: "needs_confirmation" }, () => {
      throw new UserMustConfirmToJoinOrganizationError(organization_id);
    })
    .with({ type: "moderation_required" }, async () => {
      await createModeration({
        user_id,
        organization_id,
        type: ModerationTypeSchema.enum.non_verified_domain,
        ticket_id: null,
      });
      return linkUserToOrganization({
        organization_id,
        user_id,
        verification_type: "domain_not_verified_yet",
      });
    })
    .with({ type: "unable_to_auto_join" }, () => {
      throw new UnableToAutoJoinOrganizationError(organization_id);
    })
    .exhaustive();
};

export const forceJoinOrganization = forceJoinOrganizationFactory({
  findEmailDomainsByOrganizationId,
  getUserById,
  getById,
  linkUserToOrganization,
});

export const greetForJoiningOrganization = async ({
  user_id,
  organization_id,
}: {
  user_id: number;
  organization_id: number;
}) => {
  const userOrganisations = await getOrganizationsByUserId(user_id);
  const organization = userOrganisations.find(
    ({ id }) => id === organization_id,
  );

  if (isEmpty(organization)) throw new OrganizationNotFoundError();

  const { given_name, family_name, email } = await getUserById(user_id);

  await sendMail({
    to: [email],
    subject: "Votre compte ProConnect a bien été créé",
    html: Welcome({
      baseurl: HOST,
      family_name: family_name ?? "",
      given_name: given_name ?? "",
    }).toString(),
    tag: "welcome",
  });

  return await updateUserOrganizationLink(organization_id, user_id, {
    has_been_greeted: true,
  });
};

export const greetForCertification = async ({
  user_id,
  organization_id,
}: {
  user_id: number;
  organization_id: number;
}) => {
  const userOrganisations = await getOrganizationsByUserId(user_id);
  const organization = userOrganisations.find(
    ({ id }) => id === organization_id,
  );

  if (isEmpty(organization)) throw new OrganizationNotFoundError();

  return await updateUserOrganizationLink(organization_id, user_id, {
    has_been_greeted: true,
  });
};

export const createPendingModeration = async ({
  user,
  organization,
}: {
  user: User;
  organization: Organization;
}) => {
  let ticket_id = null;
  const { id: user_id, email } = user;
  const { id: organization_id, siret, cached_libelle } = organization;

  if (CRISP_WEBSITE_ID) {
    ticket_id = await startCripsConversation({
      content: unableToAutoJoinOrganizationMd(),
      email,
      subject: `[ProConnect] Demande pour rejoindre ${cached_libelle || siret}`,
    });
  } else {
    logger.info(
      `unable_to_auto_join_organization_md mail not send to ${email}:`,
    );
    logger.info({
      libelle: cached_libelle || siret,
    });
  }

  return createModeration({
    user_id,
    organization_id,
    type: ModerationTypeSchema.enum.organization_join_block,
    ticket_id,
  });
};
