import { generateDicewarePhrase } from "@proconnect-gouv/proconnect.core/security";
import { OfficialContactEmailVerification } from "@proconnect-gouv/proconnect.email";
import { NotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import type {
  Organization,
  UserOrganizationLink,
} from "@proconnect-gouv/proconnect.identite/types";
import { LinkEnum } from "@proconnect-gouv/proconnect.identite/types";
import { isEmpty } from "lodash-es";
import { OFFICIAL_CONTACT_EMAIL_VERIFICATION_TOKEN_EXPIRATION_DURATION_IN_MINUTES } from "../../config/env";
import { ApiAnnuaireError, InvalidTokenError } from "../../config/errors";
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

export type OfficialContactEmailVerificationOutcome =
  | { kind: "not_needed" }
  | { kind: "contact_email_choice_needed" }
  | { kind: "contact_email_mismatch" }
  | {
      kind: "verification_pending";
      codeSent: boolean;
      contactEmail: string;
      libelle: string | null;
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
}): Promise<OfficialContactEmailVerificationOutcome> => {
  const user = await users.findById(user_id);
  const organization = await organizations.findById(organization_id);
  if (isEmpty(user) || isEmpty(organization)) {
    throw new NotFoundError();
  }

  const link = await users_organizations.find({ organization_id, user_id });
  if (!isEmpty(link)) {
    return { kind: "not_needed" };
  }

  const {
    cached_code_officiel_geographique,
    siret,
    cached_libelle: libelle,
  } = organization;

  let contactEmails: string[] = [];
  let contactEmail;
  try {
    if (
      isCommune(organization) &&
      !isEtablissementScolaireDuPremierEtSecondDegre(organization)
    ) {
      contactEmails = await getAnnuaireServicePublicContactEmails(
        cached_code_officiel_geographique,
      );
    } else if (isEtablissementScolaireDuPremierEtSecondDegre(organization)) {
      contactEmail = await getAnnuaireEducationNationaleContactEmail(siret);
    }
  } catch (error) {
    throw new ApiAnnuaireError(undefined, { cause: error });
  }

  if (contactEmails.length > 1) {
    if (!selectedContactEmail) {
      return { kind: "contact_email_choice_needed" };
    }

    if (!contactEmails.includes(selectedContactEmail)) {
      return { kind: "contact_email_mismatch" };
    }

    contactEmail = selectedContactEmail;
  }

  if (contactEmails.length === 1) {
    contactEmail = contactEmails[0];
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
      kind: "verification_pending",
      codeSent: false,
      contactEmail,
      libelle,
    };
  }

  const token = generateDicewarePhrase(2);

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
    kind: "verification_pending",
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

  const deleted = await official_contact_email_verifications.delete({
    organization_id,
    user_id,
  });
  if (!deleted) {
    throw new InvalidTokenError();
  }

  return await users_organizations.create({
    user_id,
    organization_id,
    verification_type: LinkEnum.enum.code_sent_to_official_contact_email,
  });
};
