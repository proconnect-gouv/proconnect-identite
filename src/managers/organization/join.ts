import { ApiEntrepriseError } from "@proconnect-gouv/proconnect.api_entreprise/types";
import { isEmailValid } from "@proconnect-gouv/proconnect.core/security";
import { getEmailDomain } from "@proconnect-gouv/proconnect.core/services/email";
import { Welcome } from "@proconnect-gouv/proconnect.email";
import {
  InvalidCertificationError,
  InvalidSiretError,
  OrganizationNotActiveError,
  OrganizationNotFoundError,
} from "@proconnect-gouv/proconnect.identite/errors";
import { forceJoinOrganizationFactory } from "@proconnect-gouv/proconnect.identite/managers/organization";
import {
  isDomainAllowedForOrganization,
  isEntrepriseUnipersonnelle,
  isPublicService,
  isSyndicatCommunal,
} from "@proconnect-gouv/proconnect.identite/services/organization";
import type {
  Organization,
  UserOrganizationLink,
} from "@proconnect-gouv/proconnect.identite/types";
import * as Sentry from "@sentry/node";
import { isEmpty, some } from "lodash-es";
import { AssertionError } from "node:assert";
import { inspect } from "node:util";
import {
  CRISP_WEBSITE_ID,
  FEATURE_BYPASS_MODERATION,
  HOST,
  MAX_SUGGESTED_ORGANIZATIONS,
} from "../../config/env";
import {
  AccessRestrictedToPublicServiceEmailError,
  DomainRestrictedError,
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
import {
  hasLessThanFiftyEmployees,
  isArmeeDomain,
  isCommune,
  isEducationNationaleDomain,
  isEtablissementScolaireDuPremierEtSecondDegre,
  isSmallAssociation,
} from "../../services/organization";
import { unableToAutoJoinOrganizationMd } from "../../views/mails/unable-to-auto-join-organization";
import { performCertificationDirigeant } from "../certification";
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
export const joinOrganization = async ({
  siret,
  user_id,
  confirmed = false,
  certificationRequested = false,
}: {
  siret: string;
  user_id: number;
  confirmed: boolean;
  certificationRequested?: boolean;
}): Promise<UserOrganizationLink> => {
  // Update organizationInfo
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

  // Ensure the organization is active
  if (!organization.cached_est_active) {
    throw new OrganizationNotActiveError();
  }

  // Ensure user_id is valid
  const user = await getUserById(user_id);

  const usersOrganizations = await findByUserId(user_id);
  if (some(usersOrganizations, ["id", organization.id])) {
    throw new UserInOrganizationAlreadyError();
  }

  const pendingModeration = await findPendingModeration({
    user_id,
    organization_id: organization.id,
    type: "organization_join_block",
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
    type: "organization_join_block",
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

  const { id: organization_id, cached_libelle } = organization;
  const { email, given_name, family_name } = user;
  const domain = getEmailDomain(email);
  const organizationEmailDomains =
    await findEmailDomainsByOrganizationId(organization_id);

  if (!isDomainAllowedForOrganization(siret, domain)) {
    throw new DomainRestrictedError(organization_id);
  }

  if (certificationRequested) {
    const { cause, details, ok } = await performCertificationDirigeant(
      organization,
      user_id,
    );

    logger.info(
      details.dirigeant,
      `'(${details.source})`,
      " is the closest source dirigeant to ",
      details.identity,
      " with a score of ",
      details.matches.size,
      cause,
    );

    if (!ok) {
      const matches = cause === "close_match" ? details.matches : undefined;
      throw new InvalidCertificationError(matches, cause, {
        cause: new AssertionError({
          expected: 0,
          actual: details.matches.size,
          operator: "isOrganizationDirigeant",
        }),
      });
    }

    return await linkUserToOrganization({
      organization_id,
      user_id,
      verification_type: "organization_dirigeant",
    });
  }

  if (isEntrepriseUnipersonnelle(organization)) {
    return await linkUserToOrganization({
      organization_id,
      user_id,
      verification_type: "no_verification_means_for_entreprise_unipersonnelle",
    });
  }

  if (isSmallAssociation(organization)) {
    return await linkUserToOrganization({
      organization_id,
      user_id,
      verification_type: "no_verification_means_for_small_association",
    });
  }

  if (
    !isCommune(organization) &&
    isAFreeEmailProvider(email) &&
    isPublicService(organization) &&
    !isSyndicatCommunal(organization)
  ) {
    throw new AccessRestrictedToPublicServiceEmailError();
  }

  if (
    isAFreeEmailProvider(email) &&
    !hasLessThanFiftyEmployees(organization) &&
    !confirmed &&
    !isSyndicatCommunal(organization)
  ) {
    throw new UserMustConfirmToJoinOrganizationError(organization_id);
  }

  if (
    isCommune(organization) &&
    !isEtablissementScolaireDuPremierEtSecondDegre(organization)
  ) {
    let contactEmail;
    try {
      contactEmail = await getAnnuaireServicePublicContactEmail(
        organization.cached_code_officiel_geographique,
        organization.cached_code_postal,
      );
    } catch (err) {
      logger.error(inspect(err, { depth: 3 }));
      Sentry.captureException(err);
    }

    if (isEmailValid(contactEmail)) {
      const contactDomain = getEmailDomain(contactEmail);

      if (!isAFreeEmailProvider(contactDomain)) {
        await markDomainAsVerified({
          organization_id,
          domain: contactDomain,
          domain_verification_type: "official_contact",
        });
      }

      if (contactEmail === email) {
        return await linkUserToOrganization({
          organization_id,
          user_id,
          verification_type: "official_contact_email",
        });
      }

      if (!isAFreeEmailProvider(contactDomain) && contactDomain === domain) {
        return await linkUserToOrganization({
          organization_id,
          user_id,
          verification_type: "domain",
        });
      }

      return await linkUserToOrganization({
        organization_id,
        user_id,
        verification_type: "code_sent_to_official_contact_email",
        needs_official_contact_email_verification: true,
      });
    }
  }

  if (isEtablissementScolaireDuPremierEtSecondDegre(organization)) {
    let contactEmail;
    try {
      contactEmail = await getAnnuaireEducationNationaleContactEmail(siret);
    } catch (err) {
      logger.error(err);
      Sentry.captureException(err);
    }

    if (contactEmail === email) {
      return await linkUserToOrganization({
        organization_id,
        user_id,
        verification_type: "official_contact_email",
      });
    }

    if (isEmailValid(contactEmail)) {
      return await linkUserToOrganization({
        organization_id,
        user_id,
        verification_type: "code_sent_to_official_contact_email",
        needs_official_contact_email_verification: true,
      });
    }
  }

  if (
    some(organizationEmailDomains, { domain, verification_type: "verified" })
  ) {
    return await linkUserToOrganization({
      organization_id,
      user_id,
      verification_type: "domain",
    });
  }

  if (
    some(organizationEmailDomains, { domain, verification_type: "external" })
  ) {
    return await linkUserToOrganization({
      organization_id,
      user_id,
      is_external: true,
      verification_type: "domain",
    });
  }

  if (
    some(organizationEmailDomains, {
      domain,
      verification_type: "trackdechets_postal_mail",
    })
  ) {
    return await linkUserToOrganization({
      organization_id,
      user_id,
      verification_type: "domain",
    });
  }

  if (FEATURE_BYPASS_MODERATION) {
    return await linkUserToOrganization({
      organization_id,
      user_id,
      verification_type: "bypassed",
    });
  }

  if (some(organizationEmailDomains, { domain, verification_type: null })) {
    await createModeration({
      user_id,
      organization_id,
      type: "non_verified_domain",
      ticket_id: null,
    });
    return await linkUserToOrganization({
      organization_id,
      user_id,
      verification_type: null,
    });
  }

  let ticket_id = null;
  if (CRISP_WEBSITE_ID) {
    ticket_id = await startCripsConversation({
      content: unableToAutoJoinOrganizationMd(),
      email,
      nickname: `${given_name} ${family_name}`,
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

  const { id: moderation_id } = await createModeration({
    user_id,
    organization_id,
    type: "organization_join_block",
    ticket_id,
  });

  throw new UnableToAutoJoinOrganizationError(moderation_id);
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

  // Welcome the user when he joins is first organization as he may now be able to connect
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
