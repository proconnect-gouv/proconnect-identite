import { generateDicewarePassword } from "@proconnect-gouv/proconnect.core/security";
import { OfficialContactEmailVerification } from "@proconnect-gouv/proconnect.email";
import { NotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import type { UserOrganizationLink } from "@proconnect-gouv/proconnect.identite/types";
import { isEmpty } from "lodash-es";
import { HOST } from "../../config/env";
import {
  ApiAnnuaireError,
  InvalidTokenError,
  OfficialContactEmailVerificationNotNeededError,
} from "../../config/errors";
import { getAnnuaireEducationNationaleContactEmail } from "../../connectors/api-annuaire-education-nationale";
import { getAnnuaireServicePublicContactEmail } from "../../connectors/api-annuaire-service-public";
import { sendMail } from "../../connectors/mail";
import {
  findById as findOrganizationById,
  getUsers,
} from "../../repositories/organization/getters";
import { updateUserOrganizationLink } from "../../repositories/organization/setters";
import { isExpired } from "../../services/is-expired";
import {
  isCommune,
  isEtablissementScolaireDuPremierEtSecondDegre,
} from "../../services/organization";

const OFFICIAL_CONTACT_EMAIL_VERIFICATION_TOKEN_EXPIRATION_DURATION_IN_MINUTES = 60;

export const sendOfficialContactEmailVerificationEmail = async ({
  user_id,
  organization_id,
  checkBeforeSend,
}: {
  user_id: number;
  organization_id: number;
  checkBeforeSend: boolean;
}): Promise<{
  codeSent: boolean;
  contactEmail: string;
  libelle: string | null;
}> => {
  const organizationUsers = await getUsers(organization_id);
  const user = organizationUsers.find(({ id }) => id === user_id);
  const organization = await findOrganizationById(organization_id);

  // The user should be in the organization already
  if (isEmpty(user) || isEmpty(organization)) {
    throw new NotFoundError();
  }

  const { verification_type, official_contact_email_verification_sent_at } =
    user;

  if (verification_type !== "pending_code_sent_to_official_contact_email") {
    throw new OfficialContactEmailVerificationNotNeededError();
  }

  const {
    cached_code_officiel_geographique,
    cached_code_postal,
    siret,
    cached_libelle: libelle,
  } = organization;

  let contactEmail;
  try {
    if (
      isCommune(organization) &&
      !isEtablissementScolaireDuPremierEtSecondDegre(organization)
    ) {
      contactEmail = await getAnnuaireServicePublicContactEmail(
        cached_code_officiel_geographique,
        cached_code_postal,
      );
    } else if (isEtablissementScolaireDuPremierEtSecondDegre(organization)) {
      contactEmail = await getAnnuaireEducationNationaleContactEmail(siret);
    }
  } catch (error) {
    throw new ApiAnnuaireError(undefined, { cause: error });
  }

  if (!contactEmail) {
    // This should never happen
    throw new NotFoundError();
  }

  if (
    checkBeforeSend &&
    !isExpired(
      official_contact_email_verification_sent_at,
      OFFICIAL_CONTACT_EMAIL_VERIFICATION_TOKEN_EXPIRATION_DURATION_IN_MINUTES,
    )
  ) {
    return { codeSent: false, contactEmail, libelle };
  }

  const official_contact_email_verification_token = generateDicewarePassword();

  await updateUserOrganizationLink(organization_id, user_id, {
    official_contact_email_verification_token,
    official_contact_email_verification_sent_at: new Date(),
  });

  const { given_name, family_name, email } = user;

  await sendMail({
    to: [contactEmail],
    subject: `[ProConnect] Authentifier un email sur ProConnect`,
    html: OfficialContactEmailVerification({
      baseurl: HOST,
      given_name: given_name ?? "",
      family_name: family_name ?? "",
      email,
      libelle: libelle ?? "",
      token: official_contact_email_verification_token,
    }).toString(),
    tag: "official-contact-email-verification",
  });

  return { codeSent: true, contactEmail, libelle };
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
  const organizationUsers = await getUsers(organization_id);
  const user = organizationUsers.find(({ id }) => id === user_id);
  const organization = await findOrganizationById(organization_id);

  // The user should be in the organization already
  if (
    isEmpty(user) ||
    isEmpty(organization) ||
    user.verification_type !== "pending_code_sent_to_official_contact_email"
  ) {
    throw new NotFoundError();
  }

  const {
    official_contact_email_verification_token,
    official_contact_email_verification_sent_at,
  } = user;

  if (official_contact_email_verification_token !== token) {
    throw new InvalidTokenError();
  }

  const isTokenExpired = isExpired(
    official_contact_email_verification_sent_at,
    OFFICIAL_CONTACT_EMAIL_VERIFICATION_TOKEN_EXPIRATION_DURATION_IN_MINUTES,
  );

  if (isTokenExpired) {
    throw new InvalidTokenError();
  }

  return await updateUserOrganizationLink(organization_id, user_id, {
    verification_type: "code_sent_to_official_contact_email",
    official_contact_email_verification_token: null,
    official_contact_email_verification_sent_at: null,
  });
};
