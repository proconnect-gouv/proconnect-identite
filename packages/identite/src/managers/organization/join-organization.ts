//

import {
  AccessRestrictedToPublicServiceEmailError,
  DomainRestrictedError,
  InvalidCertificationError,
  InvalidSiretError,
  OrganizationNotActiveError,
  UnableToAutoJoinOrganizationError,
  UserAlreadyAskedToJoinOrganizationError,
  UserInOrganizationAlreadyError,
  UserModerationRejectedError,
} from "#src/errors";
import type { FindEmailDomainsByOrganizationIdHandler } from "#src/repositories/email-domain";
import type {
  FindByUserIdHandler,
  LinkUserToOrganizationHandler,
  UpsertHandler,
} from "#src/repositories/organization";
import type { GetByIdHandler } from "#src/repositories/user";
import {
  hasLessThanFiftyEmployees,
  isCommune,
  isDomainAllowedForOrganization,
  isEntrepriseUnipersonnelle,
  isEtablissementScolaireDuPremierEtSecondDegre,
  isPublicService,
  isSmallAssociation,
  UserMustConfirmToJoinOrganizationError,
} from "#src/services/organization";
import type { OrganizationInfo } from "#src/types";
import { isEmailValid } from "@proconnect-gouv/proconnect.core/security";
import { getEmailDomain } from "@proconnect-gouv/proconnect.core/services/email";
import { EntrepriseApiError } from "@proconnect-gouv/proconnect.entreprise/types";
import { AssertionError } from "assert";
import { isEmpty, some } from "lodash-es";
import type { IsOrganizationDirigeantHandler } from "managers/certification/is-organization-dirigeant.js";
import type { GetOrganizationInfoHandler } from "./get-organization-info.js";

type FactoryDependencies = {
  findByUserId: FindByUserIdHandler;
  findEmailDomainsByOrganizationId: FindEmailDomainsByOrganizationIdHandler;
  createModeration: (...args: any[]) => Promise<{ id: number }>;
  findPendingModeration: (...args: any[]) => Promise<{ id: number }>;
  findRejectedModeration: (...args: any[]) => Promise<{ id: number }>;
  getAnnuaireServicePublicContactEmail: (...args: any[]) => Promise<string>;
  markDomainAsVerified: (...args: any[]) => Promise<string>;
  getAnnuaireEducationNationaleContactEmail: (
    ...args: any[]
  ) => Promise<string>;
  getOrganizationInfo: GetOrganizationInfoHandler;
  getUserById: GetByIdHandler;
  isAFreeDomain: (email: string) => boolean;
  isOrganizationDirigeant: IsOrganizationDirigeantHandler;
  linkUserToOrganization: LinkUserToOrganizationHandler;
  upsert: UpsertHandler;
  startCripsConversation: (...args: any[]) => Promise<string>;
  unableToAutoJoinOrganizationMd: (...args: any[]) => Promise<string>;
  FEATURE_BYPASS_MODERATION?: boolean;
  CRISP_WEBSITE_ID?: string;
};

export function JoinOrganizationFactory({
  createModeration,
  CRISP_WEBSITE_ID,
  FEATURE_BYPASS_MODERATION = false,
  findByUserId,
  findEmailDomainsByOrganizationId,
  findPendingModeration,
  findRejectedModeration,
  getAnnuaireEducationNationaleContactEmail,
  getAnnuaireServicePublicContactEmail,
  getOrganizationInfo,
  getUserById,
  isAFreeDomain,
  isOrganizationDirigeant,
  linkUserToOrganization,
  markDomainAsVerified,
  startCripsConversation,
  unableToAutoJoinOrganizationMd,
  upsert,
}: FactoryDependencies) {
  return async function join_organization({
    siret,
    user_id,
    confirmed = false,
    certificationRequested = false,
  }: {
    siret: string;
    user_id: number;
    confirmed?: boolean;
    certificationRequested?: boolean;
  }) {
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
        verification_type:
          "no_verification_means_for_entreprise_unipersonnelle",
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
      isAFreeDomain(email) &&
      isPublicService(organization)
    ) {
      throw new AccessRestrictedToPublicServiceEmailError();
    }

    if (
      isAFreeDomain(email) &&
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
        // logger.error(inspect(err, { depth: 3 }));
        // Sentry.captureException(err);
      }

      if (isEmailValid(contactEmail)) {
        const contactDomain = getEmailDomain(contactEmail);

        if (!isAFreeDomain(contactDomain)) {
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

        if (!isAFreeDomain(contactDomain) && contactDomain === domain) {
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
        // logger.error(err);
        // Sentry.captureException(err);
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
      // logger.info(
      //   `unable_to_auto_join_organization_md mail not send to ${email}:`,
      // );
      // logger.info({
      //   libelle: cached_libelle || siret,
      // });
    }

    const { id: moderation_id } = await createModeration({
      user_id,
      organization_id,
      type: "organization_join_block",
      ticket_id,
    });

    throw new UnableToAutoJoinOrganizationError(moderation_id);
  };
}
