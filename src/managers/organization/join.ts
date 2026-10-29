import { ApiEntrepriseConnectionError } from "@proconnect-gouv/proconnect.api_entreprise/types";
import { isEmailValid } from "@proconnect-gouv/proconnect.core/security";
import { getEmailDomain } from "@proconnect-gouv/proconnect.core/services/email";
import { Welcome } from "@proconnect-gouv/proconnect.email";
import {
  InvalidSiretError,
  NotFoundError,
  OrganizationNotFoundError,
} from "@proconnect-gouv/proconnect.identite/errors";
import {
  computeServicePublicInfo,
  isDomainAllowedForOrganization,
  isEntrepriseUnipersonnelle,
  isSmallEtablissementPublic,
} from "@proconnect-gouv/proconnect.identite/services/organization";
import {
  EmailDomainVerificationEnum,
  LinkEnum,
  ModerationTypeSchema,
  type Organization,
  type User,
  type UserOrganizationLink,
} from "@proconnect-gouv/proconnect.identite/types";
import * as Sentry from "@sentry/node";
import { isEmpty, some } from "lodash-es";
import { AssertionError } from "node:assert";
import { match } from "ts-pattern";
import { EmailDomainApprovedVerificationEnum } from "../../../packages/identite/src/types";
import {
  CRISP_WEBSITE_ID,
  FEATURE_BYPASS_MODERATION,
  HOST,
  MAX_SUGGESTED_ORGANIZATIONS,
} from "../../config/env";
import {
  AccessRestrictedToPublicServiceEmailError,
  ApiAnnuaireConnectionError,
  ApiAnnuaireInvalidEmailError,
  ApiAnnuaireNotFoundError,
  DomainNotAllowedForOrganizationError,
  DomainRefusedForOrganizationError,
  GouvFrDomainsForbiddenForPrivateOrg,
  OrganizationNotActiveError,
  PendingCertificationDirigeantError,
  PendingOfficialContactEmailVerificationError,
  UnableToAutoJoinOrganizationError,
  UserAlreadyAskedToJoinOrganizationError,
  UserInOrganizationAlreadyError,
  UserModerationRejectedError,
  UserMustConfirmToJoinOrganizationError,
} from "../../config/errors";
import { getAnnuaireEducationNationaleContactEmail } from "../../connectors/api-annuaire-education-nationale";
import { getAnnuaireServicePublicContactEmails } from "../../connectors/api-annuaire-service-public";
import { context, runtime } from "../../connectors/context";
import { startCripsConversation } from "../../connectors/crisp";
import { sendMail } from "../../connectors/mail";
import { getOrganizationInfo } from "../../connectors/organization-info";
import { usesAFreeEmailProvider } from "../../services/email";
import { logger, track } from "../../services/log";
import {
  hasLessThanFiftyEmployees,
  isArmeeDomain,
  isCommune,
  isEducationNationaleDomain,
  isEtablissementScolaireDuPremierEtSecondDegre,
  isSmallAssociation,
  isSmallOrganization,
} from "../../services/organization";
import { unableToAutoJoinOrganizationMd } from "../../views/mails/unable-to-auto-join-organization";

const {
  email_domains,
  moderations,
  organizations,
  users_organizations,
  users,
} = context.repository;

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

  const userOrganizations = await organizations.findByUserId(user_id);
  if (!isEmpty(userOrganizations)) {
    return [];
  }

  const domain = getEmailDomain(email);

  if (isEducationNationaleDomain(domain)) {
    return [];
  }

  if (isArmeeDomain(domain)) {
    const armeeOrganization = await organizations.findBySiret("11009001600053");
    if (armeeOrganization) {
      return [armeeOrganization];
    }
  }

  const organizationsSuggestions =
    await organizations.findByVerifiedEmailDomain(domain);

  if (organizationsSuggestions.length <= MAX_SUGGESTED_ORGANIZATIONS) {
    return organizationsSuggestions;
  }

  // if the number of suggestions is too high,
  // only suggest organizations that represent 20% of the total member count

  const totalMemberCount = organizationsSuggestions.reduce(
    (sum, org) => sum + (org.member_count ?? 0),
    0,
  );

  if (totalMemberCount === 0) {
    return [];
  }

  return organizationsSuggestions.filter(
    (org) => (org.member_count ?? 0) / totalMemberCount >= 0.2,
  );
};

export const upsertOrganization = async (siret: string) =>
  match(await getOrganizationInfo(siret))
    .with({ kind: "api_entreprise_failed" }, ({ exception }) => {
      throw new ApiEntrepriseConnectionError(
        "unknown error while fetching entreprise.api.gouv.fr",
        { cause: exception },
      );
    })
    .with({ kind: "found" }, ({ organization_info, rne }) => {
      if (rne.kind === "failed") {
        logger.warn("api_rne.company_request.failed", { siret }, rne.exception);
      }
      return organizations.upsert({
        organizationInfo: organization_info,
        siret,
      });
    })
    .with({ kind: "invalid_siret" }, ({ exception }) => {
      throw exception;
    })
    .with({ kind: "not_diffusible" }, () => {
      throw new InvalidSiretError("not_diffusible");
    })
    .exhaustive();

export const joinOrganization = async ({
  organization,
  user_id,
  confirmed = false,
  certificationRequested = false,
  sp_name,
}: {
  organization: Organization;
  user_id: number;
  confirmed: boolean;
  certificationRequested?: boolean;
  sp_name?: string;
}): Promise<UserOrganizationLink> => {
  const { siret } = organization;

  // Ensure the organization is active
  if (!organization.cached_est_active) {
    throw new OrganizationNotActiveError();
  }

  // Ensure user_id is valid
  const user = await users.getById(user_id);

  const usersOrganizations = await organizations.findByUserId(user_id);
  if (some(usersOrganizations, ["id", organization.id])) {
    throw new UserInOrganizationAlreadyError();
  }

  const pendingModeration = await moderations.findPending({
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

  const rejectedModeration = await moderations.findRejected({
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

  const { id: organization_id } = organization;
  const { email } = user;
  const domain = getEmailDomain(email);
  const organizationEmailDomains =
    await email_domains.findEmailDomainsByOrganizationId(organization_id);

  if (!isDomainAllowedForOrganization(siret, domain)) {
    throw new DomainNotAllowedForOrganizationError(organization_id);
  }

  if (
    some(organizationEmailDomains, {
      domain,
      verification_type: EmailDomainVerificationEnum.enum.refused,
    })
  ) {
    throw new DomainRefusedForOrganizationError(organization_id);
  }

  if (
    domain.endsWith("gouv.fr") &&
    !computeServicePublicInfo(organization).isServicePublic
  ) {
    throw new GouvFrDomainsForbiddenForPrivateOrg();
  }

  if (certificationRequested) {
    throw new PendingCertificationDirigeantError(organization_id);
  }

  if (isEntrepriseUnipersonnelle(organization)) {
    return await users_organizations.create({
      organization_id,
      user_id,
      verification_type:
        LinkEnum.enum.no_verification_means_for_entreprise_unipersonnelle,
    });
  }

  if (isSmallAssociation(organization) && usesAFreeEmailProvider(email)) {
    return await users_organizations.create({
      organization_id,
      user_id,
      verification_type:
        LinkEnum.enum.no_verification_means_for_small_association,
    });
  }

  if (isSmallOrganization(organization) && usesAFreeEmailProvider(email)) {
    return await users_organizations.create({
      organization_id,
      user_id,
      verification_type:
        LinkEnum.enum.no_verification_means_for_small_organization,
    });
  }

  if (
    !isCommune(organization, true) &&
    usesAFreeEmailProvider(email) &&
    computeServicePublicInfo(organization).isServicePublic &&
    !isSmallEtablissementPublic(organization)
  ) {
    throw new AccessRestrictedToPublicServiceEmailError();
  }

  if (
    usesAFreeEmailProvider(email) &&
    !hasLessThanFiftyEmployees(organization) &&
    !confirmed &&
    !isSmallEtablissementPublic(organization)
  ) {
    throw new UserMustConfirmToJoinOrganizationError(organization_id);
  }

  if (
    isCommune(organization) &&
    !isEtablissementScolaireDuPremierEtSecondDegre(organization)
  ) {
    let contactEmails: string[] = [];
    try {
      contactEmails = await getAnnuaireServicePublicContactEmails(
        organization.cached_code_officiel_geographique,
      );
    } catch (err) {
      if (err instanceof ApiAnnuaireConnectionError) {
        track("join.annuaire_service_public.unavailable", {
          cog: organization.cached_code_officiel_geographique,
          "error.type": err.name,
          organization_id,
        });
      } else if (err instanceof ApiAnnuaireNotFoundError) {
        track("join.annuaire_service_public.contact_email_not_found", {
          cog: organization.cached_code_officiel_geographique,
          "error.type": err.name,
          organization_id,
        });
      } else {
        logger.error(err);
        Sentry.captureException(err);
      }
    }

    for (const contactEmail of contactEmails) {
      if (!isEmailValid(contactEmail)) {
        continue;
      }

      const contactDomain = getEmailDomain(contactEmail);

      if (!usesAFreeEmailProvider(contactEmail)) {
        const outcome = await runtime.markDomainAsVerified({
          organization_id,
          domain: contactDomain,
          domain_verification_type:
            EmailDomainVerificationEnum.enum.official_contact,
        });
        match(outcome)
          .with(
            { kind: "domain_verified" },
            ({ email_domain, promoted_members, replaced_verification_types }) =>
              track("join.official_contact_domain.verified", {
                domain: contactDomain,
                email_domain_id: email_domain.id,
                organization_id,
                promoted_user_ids: promoted_members.map(({ user_id }) =>
                  String(user_id),
                ),
                replaced_verification_types,
              }),
          )
          .with({ kind: "organization_not_found" }, () => {
            throw new NotFoundError();
          })
          .exhaustive();
      }

      if (contactEmail === email) {
        return await users_organizations.create({
          organization_id,
          user_id,
          verification_type: LinkEnum.enum.official_contact_email,
        });
      }

      if (!usesAFreeEmailProvider(contactEmail) && contactDomain === domain) {
        return await users_organizations.create({
          organization_id,
          user_id,
          verification_type: LinkEnum.enum.domain,
        });
      }
    }

    if (some(contactEmails, isEmailValid) && usesAFreeEmailProvider(email)) {
      throw new PendingOfficialContactEmailVerificationError(organization_id);
    }
  }

  if (isEtablissementScolaireDuPremierEtSecondDegre(organization)) {
    let contactEmail;
    try {
      contactEmail = await getAnnuaireEducationNationaleContactEmail(siret);
    } catch (err) {
      if (err instanceof ApiAnnuaireConnectionError) {
        track("join.annuaire_education_nationale.unavailable", {
          "error.type": err.name,
          organization_id,
          siret,
        });
      } else if (err instanceof ApiAnnuaireNotFoundError) {
        track("join.annuaire_education_nationale.contact_email_not_found", {
          "error.type": err.name,
          organization_id,
          siret,
        });
      } else if (err instanceof ApiAnnuaireInvalidEmailError) {
        track("join.annuaire_education_nationale.contact_email_invalid", {
          "error.type": err.name,
          organization_id,
          siret,
        });
      } else {
        logger.error(err);
        Sentry.captureException(err);
      }
    }

    if (contactEmail === email) {
      return await users_organizations.create({
        organization_id,
        user_id,
        verification_type: LinkEnum.enum.official_contact_email,
      });
    }

    if (isEmailValid(contactEmail)) {
      throw new PendingOfficialContactEmailVerificationError(organization_id);
    }
  }

  const approvedEmailDomain = organizationEmailDomains.find(
    ({ domain: organization_domain, verification_type }) =>
      organization_domain === domain &&
      EmailDomainApprovedVerificationEnum.safeParse(verification_type).success,
  );

  if (approvedEmailDomain) {
    return await users_organizations.create({
      organization_id,
      user_id,
      is_external:
        approvedEmailDomain.verification_type ===
        EmailDomainVerificationEnum.enum.external,
      verification_type: LinkEnum.enum.domain,
    });
  }

  if (FEATURE_BYPASS_MODERATION) {
    return await users_organizations.create({
      organization_id,
      user_id,
      verification_type: LinkEnum.enum.bypassed,
    });
  }

  if (
    some(organizationEmailDomains, {
      domain,
      verification_type: EmailDomainVerificationEnum.enum.not_verified_yet,
    })
  ) {
    await moderations.create({
      user_id,
      organization_id,
      type: ModerationTypeSchema.enum.non_verified_domain,
      ticket_id: null,
      sp_name,
    });
    return await users_organizations.create({
      organization_id,
      user_id,
      verification_type: LinkEnum.enum.domain_not_verified_yet,
    });
  }

  throw new UnableToAutoJoinOrganizationError(organization_id);
};

export const greetForJoiningOrganization = async ({
  user_id,
  organization_id,
}: {
  user_id: number;
  organization_id: number;
}) => {
  const userOrganisations = await organizations.findByUserId(user_id);
  const organization = userOrganisations.find(
    ({ id }) => id === organization_id,
  );

  if (isEmpty(organization)) throw new OrganizationNotFoundError();

  const { given_name, family_name, email } = await users.getById(user_id);

  // Welcome the user when he joins is first organization as he may now be able to connect
  await sendMail({
    to: [email],
    subject: "Votre compte ProConnect a bien été créé",
    html: Welcome({
      base_url: HOST,
      family_name: family_name ?? "",
      given_name: given_name ?? "",
    }).toString(),
    tag: "welcome",
  });
};

export const createPendingModeration = async ({
  user,
  organization,
  sp_name,
}: {
  user: User;
  organization: Organization;
  sp_name?: string;
}) => {
  let ticket_id = null;
  const { id: user_id, email } = user;
  const { id: organization_id, siret, cached_libelle } = organization;

  if (CRISP_WEBSITE_ID) {
    ticket_id = await startCripsConversation({
      content: unableToAutoJoinOrganizationMd({ siret, cached_libelle }),
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

  return moderations.create({
    user_id,
    organization_id,
    sp_name,
    type: ModerationTypeSchema.enum.organization_join_block,
    ticket_id,
  });
};
