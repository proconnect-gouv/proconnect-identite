import { generateDicewarePassword } from "@proconnect-gouv/proconnect.core/security";
import { OfficialContactEmailVerification } from "@proconnect-gouv/proconnect.email";
import { NotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import type {
  Organization,
  UserOrganizationLink,
} from "@proconnect-gouv/proconnect.identite/types";
import { LinkEnum } from "@proconnect-gouv/proconnect.identite/types";
import { isEmpty } from "lodash-es";
import { OFFICIAL_CONTACT_EMAIL_VERIFICATION_TOKEN_EXPIRATION_DURATION_IN_MINUTES } from "../../config/env";
import {
  ApiAnnuaireContactEmailMismatchError,
  ApiAnnuaireError,
  ApiAnnuaireSeveralMairiesMatchesError,
  InvalidTokenError,
  OfficialContactEmailVerificationNotNeededError,
} from "../../config/errors";
import { getAnnuaireEducationNationaleContactEmail } from "../../connectors/api-annuaire-education-nationale";
import { getAnnuaireServicePublicContactEmails } from "../../connectors/api-annuaire-service-public";
import { context } from "../../connectors/context";
import { sendMail } from "../../connectors/mail";
import { isExpired } from "../../services/is-expired";
import {
  isCommune,
  isEtablissementScolaireDuPremierEtSecondDegre,
} from "../../services/organization";
const {
  official_contact_email_verifications,
  organizations,
  users_organizations,
  users,
} = context.repository;

export const isCommuneWithMultipleOfficialContactEmails = async (
  organization: Organization,
) => {
  if (
    !isCommune(organization) ||
    isEtablissementScolaireDuPremierEtSecondDegre(organization)
  ) {
    return false;
  }

  const contactEmails = await getAnnuaireServicePublicContactEmails(
    organization.cached_code_officiel_geographique,
  );

  return contactEmails.length > 1;
};

export const sendOfficialContactEmailVerificationEmail = async ({
  user_id,
  organization_id,
  checkBeforeSend,
  selectedContactEmail,
}: {
  user_id: number;
  organization_id: number;
  checkBeforeSend: boolean;
  selectedContactEmail?: string;
}): Promise<{
  codeSent: boolean;
  contactEmail: string;
  libelle: string | null;
}> => {
  const user = await users.findById(user_id);
  const organization = await organizations.findById(organization_id);
  if (isEmpty(user) || isEmpty(organization)) {
    throw new NotFoundError();
  }

  const link = await users_organizations.find({ organization_id, user_id });
  if (!isEmpty(link)) {
    throw new OfficialContactEmailVerificationNotNeededError();
  }

  const {
    cached_code_officiel_geographique,
    siret,
    cached_libelle: libelle,
  } = organization;

  let contactEmail;
  try {
    if (
      isCommune(organization) &&
      !isEtablissementScolaireDuPremierEtSecondDegre(organization)
    ) {
      const contactEmails = await getAnnuaireServicePublicContactEmails(
        cached_code_officiel_geographique,
      );
      if (contactEmails.length > 1) {
        if (!selectedContactEmail) {
          throw new ApiAnnuaireSeveralMairiesMatchesError();
        }

        if (!contactEmails.includes(selectedContactEmail)) {
          throw new ApiAnnuaireContactEmailMismatchError();
        }

        contactEmail = selectedContactEmail;
      }

      if (contactEmails.length === 1) {
        contactEmail = contactEmails[0];
      }
    } else if (isEtablissementScolaireDuPremierEtSecondDegre(organization)) {
      contactEmail = await getAnnuaireEducationNationaleContactEmail(siret);
    }
  } catch (error) {
    throw new ApiAnnuaireError(undefined, { cause: error });
  }

  if (!contactEmail) {
    throw new NotFoundError();
  }

  const officialContactEmailVerification =
    await official_contact_email_verifications.find({
      organization_id,
      user_id,
    });

  if (
    checkBeforeSend &&
    !isExpired(
      officialContactEmailVerification?.sent_at || null,
      OFFICIAL_CONTACT_EMAIL_VERIFICATION_TOKEN_EXPIRATION_DURATION_IN_MINUTES,
    )
  ) {
    return {
      codeSent: false,
      contactEmail,
      libelle,
    };
  }

  const token = generateDicewarePassword();

  await official_contact_email_verifications.upsert({
    organization_id,
    user_id,
    token,
    sent_at: new Date(),
  });

  const { given_name, family_name, email } = user;

  await sendMail({
    to: [contactEmail],
    subject: `[ProConnect] Authentifier un email sur ProConnect`,
    html: OfficialContactEmailVerification({
      given_name: given_name ?? "",
      family_name: family_name ?? "",
      email,
      libelle: libelle ?? "",
      token,
    }).toString(),
    tag: "official-contact-email-verification",
  });

  return {
    codeSent: true,
    contactEmail,
    libelle,
  };
};

export const verifyOfficialContactEmailToken = async ({
  user_id,
  organization_id,
  token,
}: {
  user_id: number;
  organization_id: number;
  token: string;
}): Promise<UserOrganizationLink> => {
  const user = await users.findById(user_id);
  const organization = await organizations.findById(organization_id);
  const officialContactEmailVerification =
    await official_contact_email_verifications.find({
      organization_id,
      user_id,
    });
  if (
    isEmpty(user) ||
    isEmpty(organization) ||
    isEmpty(officialContactEmailVerification)
  ) {
    throw new NotFoundError();
  }

  if (officialContactEmailVerification.token !== token) {
    throw new InvalidTokenError();
  }

  const isTokenExpired = isExpired(
    officialContactEmailVerification.sent_at,
    OFFICIAL_CONTACT_EMAIL_VERIFICATION_TOKEN_EXPIRATION_DURATION_IN_MINUTES,
  );

  if (isTokenExpired) {
    throw new InvalidTokenError();
  }

  await official_contact_email_verifications.delete({
    organization_id,
    user_id,
  });
  return await users_organizations.create({
    user_id,
    organization_id,
    verification_type: LinkEnum.enum.code_sent_to_official_contact_email,
  });
};
