import { isEmailValid } from "@gouvfr-lasuite/proconnect.core/security";
import { getEmailDomain } from "@gouvfr-lasuite/proconnect.core/services/email";
import { Welcome } from "@gouvfr-lasuite/proconnect.email";
import { EntrepriseApiError } from "@gouvfr-lasuite/proconnect.entreprise/types";
import {
  InvalidCertificationError,
  InvalidSiretError,
  OrganizationNotActiveError,
  OrganizationNotFoundError,
} from "@gouvfr-lasuite/proconnect.identite/errors";
import { forceJoinOrganizationFactory } from "@gouvfr-lasuite/proconnect.identite/managers/organization";
import type {
  Organization,
  OrganizationInfo,
  UserOrganizationLink,
} from "@gouvfr-lasuite/proconnect.identite/types";
import * as Sentry from "@sentry/node";
import { isEmpty, some } from "lodash-es";
import { inspect } from "node:util";
import {
  CRISP_WEBSITE_ID,
  FEATURE_BYPASS_MODERATION,
  HOST,
  MAX_SUGGESTED_ORGANIZATIONS,
} from "../../config/env";
import {
  UnableToAutoJoinOrganizationError,
  UserAlreadyAskedToJoinOrganizationError,
  UserInOrganizationAlreadyError,
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
} from "../../repositories/moderation";
import {
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
  isCommune,
  isEducationNationaleDomain,
  isEntrepriseUnipersonnelle,
  isEtablissementScolaireDuPremierEtSecondDegre,
  isSmallAssociation,
} from "../../services/organization";
import { unableToAutoJoinOrganizationMd } from "../../views/mails/unable-to-auto-join-organization";
import { isOrganizationDirigeant } from "../certification";
import { getOrganizationsByUserId, markDomainAsVerified } from "./main";

export const doSuggestOrganizations = async ({
  user_id,
  email,
}: {
  user_id: number;
  email: string;
}): Promise<boolean> => {
  if (usesAFreeEmailProvider(email)) {
    return false;
  }

  const domain = getEmailDomain(email);
  const organizationsSuggestions = await findByVerifiedEmailDomain(domain);
  const userOrganizations = await findByUserId(user_id);

  return (
    isEmpty(userOrganizations) &&
    !isEmpty(organizationsSuggestions) &&
    organizationsSuggestions.length <= MAX_SUGGESTED_ORGANIZATIONS
  );
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

  const domain = getEmailDomain(email);

  if (isEducationNationaleDomain(domain)) {
    return [];
  }

  const organizationsSuggestions = await findByVerifiedEmailDomain(domain);

  if (organizationsSuggestions.length > MAX_SUGGESTED_ORGANIZATIONS) {
    return [];
  }

  const userOrganizations = await findByUserId(user_id);
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
  let organizationInfo: OrganizationInfo;
  try {
    organizationInfo = await getOrganizationInfo(siret);
  } catch (error) {
    if (error instanceof EntrepriseApiError) {
      throw error;
    }

    throw new InvalidSiretError("", { cause: error });
  }
  let organization = await upsert({
    siret,
    organizationInfo,
  });

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
    throw new UserAlreadyAskedToJoinOrganizationError(moderation_id);
  }

  const { id: organization_id, cached_libelle } = organization;
  const { email, given_name, family_name } = user;
  const domain = getEmailDomain(email);
  const organizationEmailDomains =
    await findEmailDomainsByOrganizationId(organization_id);

  if (certificationRequested) {
    const isDirigeant = await isOrganizationDirigeant(siret, user_id);

    if (!isDirigeant) throw new InvalidCertificationError();

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
    isAFreeEmailProvider(email) &&
    !hasLessThanFiftyEmployees(organization) &&
    !confirmed
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

      if (
        (isAFreeEmailProvider(contactDomain) ||
          hasLessThanFiftyEmployees(organization)) &&
        isAFreeEmailProvider(domain)
      ) {
        return await linkUserToOrganization({
          organization_id,
          user_id,
          verification_type: "code_sent_to_official_contact_email",
          needs_official_contact_email_verification: true,
        });
      }
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
