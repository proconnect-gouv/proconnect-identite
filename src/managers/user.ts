import {
  generatePinToken,
  generateToken,
  hashPassword,
  isPasswordSecure,
  validatePassword,
} from "@gouvfr-lasuite/proconnect.core/security";
import { getDidYouMeanSuggestion } from "@gouvfr-lasuite/proconnect.core/services/suggestion";
import {
  Add2fa,
  AddAccessKey,
  Delete2faProtection,
  DeleteAccessKey,
  DeleteAccount,
  DeleteFreeTotpMail,
  MagicLink,
  ResetPassword,
  UpdatePersonalDataMail,
  VerifyEmail,
} from "@gouvfr-lasuite/proconnect.email";
import {
  NotFoundError,
  UserNotFoundError,
} from "@gouvfr-lasuite/proconnect.identite/errors";
import {
  type FranceConnectUserInfoResponse,
  type User,
} from "@gouvfr-lasuite/proconnect.identite/types";
import { to } from "await-to-js";
import { isEmpty } from "lodash-es";
import { AssertionError } from "node:assert";
import {
  FRANCECONNECT_VERIFICATION_MAX_AGE_IN_MINUTES,
  HOST,
  MAGIC_LINK_TOKEN_EXPIRATION_DURATION_IN_MINUTES,
  MAX_DURATION_BETWEEN_TWO_EMAIL_ADDRESS_VERIFICATION_IN_MINUTES,
  RESET_PASSWORD_TOKEN_EXPIRATION_DURATION_IN_MINUTES,
  VERIFY_EMAIL_TOKEN_EXPIRATION_DURATION_IN_MINUTES,
} from "../config/env";
import {
  EmailUnavailableError,
  InvalidCredentialsError,
  InvalidEmailError,
  InvalidMagicLinkError,
  InvalidTokenError,
  LeakedPasswordError,
  NoNeedVerifyEmailAddressError,
  WeakPasswordError,
} from "../config/errors";
import { isEmailSafeToSendTransactional } from "../connectors/debounce";
import { sendMail } from "../connectors/mail";
import { hasPasswordBeenPwned } from "../connectors/pwnedpasswords";
import {
  create,
  findByEmail,
  findByMagicLinkToken,
  findByResetPasswordToken,
  getById,
  getFranceConnectUserInfo,
  update,
  upsetFranceconnectUserinfo,
} from "../repositories/user";
import { isExpired } from "../services/is-expired";
import { isWebauthnConfiguredForUser } from "./webauthn";

export const startLogin = async (
  email: string,
): Promise<{
  email: string;
  userExists: boolean;
  hasAPassword: boolean;
  hasWebauthnConfigured: boolean;
  needsInclusionconnectWelcomePage: boolean;
}> => {
  const user = await findByEmail(email);
  const userExists = !isEmpty(user);

  if (userExists) {
    return {
      email,
      userExists: true,
      hasAPassword: !!user.encrypted_password,
      hasWebauthnConfigured: await isWebauthnConfiguredForUser(user.id),
      needsInclusionconnectWelcomePage:
        user?.needs_inclusionconnect_welcome_page,
    };
  }

  let { isEmailSafeToSend, didYouMean } =
    await isEmailSafeToSendTransactional(email);

  if (!isEmailSafeToSend) {
    if (!didYouMean) {
      didYouMean = getDidYouMeanSuggestion(email);
    }

    throw new InvalidEmailError(didYouMean, {
      cause: new AssertionError({
        actual: email,
        expected: didYouMean,
        operator: "isEmailSafeToSendTransactional",
      }),
    });
  }

  return {
    email,
    userExists: false,
    hasAPassword: false,
    hasWebauthnConfigured: false,
    needsInclusionconnectWelcomePage: false,
  };
};

export const loginWithPassword = async (
  email: string,
  password: string,
): Promise<User> => {
  const user = await findByEmail(email);
  if (isEmpty(user)) {
    throw new NotFoundError();
  }

  const isMatch = await validatePassword(password, user.encrypted_password);

  if (!isMatch) {
    throw new InvalidCredentialsError();
  }

  return user;
};

export const signupWithPassword = async (
  email: string,
  password: string,
): Promise<User> => {
  const user = await findByEmail(email);

  if (!isEmpty(user) && !isEmpty(user.encrypted_password)) {
    throw new EmailUnavailableError();
  }

  if (!isPasswordSecure(password, email)) {
    throw new WeakPasswordError();
  }

  if (await hasPasswordBeenPwned(password)) {
    throw new LeakedPasswordError();
  }

  const hashedPassword = await hashPassword(password);

  if (!isEmpty(user)) {
    // force email verification after setting a password for the first time for an existing user
    return await update(user.id, {
      email_verified: false,
      encrypted_password: hashedPassword,
    });
  }

  return await create({
    email,
    encrypted_password: hashedPassword,
  });
};

export const sendEmailAddressVerificationEmail = async ({
  email,
  isBrowserTrusted,
  force = false,
}: {
  email: string;
  isBrowserTrusted: boolean;
  force?: boolean;
}): Promise<{ codeSent: boolean; updatedUser: User }> => {
  const user = await findByEmail(email);

  if (isEmpty(user)) {
    throw new UserNotFoundError();
  }

  const renewalNeeded = isExpired(
    user.email_verified_at,
    MAX_DURATION_BETWEEN_TWO_EMAIL_ADDRESS_VERIFICATION_IN_MINUTES,
  );

  if (isBrowserTrusted && user.email_verified && !renewalNeeded) {
    throw new NoNeedVerifyEmailAddressError();
  }

  const isTokenExpired = isExpired(
    user.verify_email_sent_at,
    VERIFY_EMAIL_TOKEN_EXPIRATION_DURATION_IN_MINUTES,
  );

  if (!(force || isTokenExpired)) {
    return { codeSent: false, updatedUser: user };
  }

  const verify_email_token = generatePinToken();

  const updatedUser = await update(user.id, {
    verify_email_token,
    verify_email_sent_at: new Date(),
  });

  await sendMail({
    to: [user.email],
    subject: "Vérification de votre adresse email",
    html: VerifyEmail({
      baseurl: HOST,
      token: verify_email_token,
    }).toString(),
    tag: "verify-email",
  });

  return { codeSent: true, updatedUser };
};

export const sendDeleteUserEmail = async ({ user_id }: { user_id: number }) => {
  const { given_name, family_name, email } = await getById(user_id);

  return sendMail({
    to: [email],
    subject: "Suppression de compte",
    html: DeleteAccount({
      baseurl: HOST,
      family_name: family_name ?? "",
      given_name: given_name ?? "",
      support_email: "support+identite@proconnect.gouv.fr",
    }).toString(),
    tag: "delete-account",
  });
};

export const sendDeleteFreeTOTPApplicationEmail = async ({
  user_id,
}: {
  user_id: number;
}) => {
  const { given_name, family_name, email } = await getById(user_id);

  return sendMail({
    to: [email],
    subject:
      "Suppression d'une application d'authentification à double facteur",
    html: DeleteFreeTotpMail({
      baseurl: HOST,
      family_name: family_name ?? "",
      given_name: given_name ?? "",
      support_email: "support+identite@proconnect.gouv.fr",
    }).toString(),
    tag: "delete-free-totp",
  });
};

export const sendDisable2faMail = async ({ user_id }: { user_id: number }) => {
  const { given_name, family_name, email } = await getById(user_id);

  return sendMail({
    to: [email],
    subject: "Désactivation de la validation avec la double authentification",
    html: Delete2faProtection({
      baseurl: HOST,
      family_name: family_name ?? "",
      given_name: given_name ?? "",
    }).toString(),
    tag: "delete-2fa-protection",
  });
};

export const sendDeleteAccessKeyMail = async ({
  user_id,
}: {
  user_id: number;
}) => {
  const { given_name, family_name, email } = await getById(user_id);

  return sendMail({
    to: [email],
    subject: "Alerte de sécurité",
    html: DeleteAccessKey({
      baseurl: HOST,
      family_name: family_name ?? "",
      given_name: given_name ?? "",
      support_email: "support+identite@proconnect.gouv.fr",
    }).toString(),
    tag: "delete-access-key",
  });
};

export const sendAddFreeTOTPEmail = async ({
  user_id,
}: {
  user_id: number;
}) => {
  const { given_name, family_name, email } = await getById(user_id);

  return sendMail({
    to: [email],
    subject: "Double authentification activée",
    html: Add2fa({
      baseurl: HOST,
      email,
      family_name: family_name ?? "",
      given_name: given_name ?? "",
    }).toString(),
    tag: "add-2fa",
  });
};

export const sendActivateAccessKeyMail = async ({
  user_id,
}: {
  user_id: number;
}) => {
  const { given_name, family_name, email } = await getById(user_id);

  return sendMail({
    to: [email],
    subject: "Alerte de sécurité",
    html: AddAccessKey({
      baseurl: HOST,
      family_name: family_name ?? "",
      given_name: given_name ?? "",
      support_email: "support+identite@proconnect.gouv.fr",
    }).toString(),
    tag: "add-access-key",
  });
};

const allowedUpdatedKeys = [
  "given_name",
  "family_name",
  "phone_number",
  "job",
] as const;

export const sendUpdatePersonalInformationEmail = async ({
  previousInformations,
  newInformation,
}: {
  previousInformations: User;
  newInformation: User;
}) => {
  const { given_name, family_name, email } = previousInformations;

  const updatedFields = allowedUpdatedKeys.reduce(
    (acc, key) => {
      if (previousInformations[key] === newInformation[key]) {
        return acc;
      }
      return {
        ...acc,
        [key]: { new: newInformation[key], old: previousInformations[key] },
      };
    },
    {} as {
      [$Key in (typeof allowedUpdatedKeys)[number]]: {
        new: User[$Key];
        old: User[$Key];
      };
    },
  );

  if (isEmpty(updatedFields)) {
    return;
  }

  if (previousInformations !== newInformation) {
    return sendMail({
      to: [email],
      subject: "Mise à jour de vos données personnelles",
      html: UpdatePersonalDataMail({
        baseurl: HOST,
        family_name,
        given_name,
        updatedFields: updatedFields,
      }).toString(),
      tag: "update-personal-data",
    });
  }
};

export const verifyEmail = async (
  email: string,
  token: string,
): Promise<User> => {
  const user = await findByEmail(email);

  if (isEmpty(user)) {
    throw new UserNotFoundError();
  }

  if (user.verify_email_token !== token) {
    throw new InvalidTokenError();
  }

  const isTokenExpired = isExpired(
    user.verify_email_sent_at,
    VERIFY_EMAIL_TOKEN_EXPIRATION_DURATION_IN_MINUTES,
  );

  if (isTokenExpired) {
    throw new InvalidTokenError();
  }

  return await update(user.id, {
    email_verified: true,
    email_verified_at: new Date(),
    verify_email_token: null,
    verify_email_sent_at: null,
  });
};

export const needsEmailVerificationRenewal = async (
  email: string,
): Promise<boolean> => {
  const user = await findByEmail(email);

  if (isEmpty(user)) {
    throw new UserNotFoundError();
  }

  return isExpired(
    user.email_verified_at,
    MAX_DURATION_BETWEEN_TWO_EMAIL_ADDRESS_VERIFICATION_IN_MINUTES,
  );
};

export const sendSendMagicLinkEmail = async (
  email: string,
  host: string,
): Promise<boolean> => {
  let user = await findByEmail(email);

  if (isEmpty(user)) {
    user = await create({
      email,
    });
  }

  const magicLinkToken = generateToken();

  await update(user.id, {
    magic_link_token: magicLinkToken,
    magic_link_sent_at: new Date(),
  });

  await sendMail({
    to: [user.email],
    subject: "Lien de connexion à ProConnect",
    html: MagicLink({
      baseurl: host,
      magic_link: `${host}/users/sign-in-with-magic-link?magic_link_token=${magicLinkToken}`,
    })
      .toString()
      .replace(/<\//g, "\n</"),

    tag: "magic-link",
  });

  return true;
};

export const loginWithMagicLink = async (token: string): Promise<User> => {
  // check that token as not the default empty value as it will match all users
  if (!token) {
    throw new InvalidMagicLinkError();
  }

  const user = await findByMagicLinkToken(token);

  if (isEmpty(user)) {
    throw new InvalidMagicLinkError();
  }

  const isTokenExpired = isExpired(
    user.magic_link_sent_at,
    MAGIC_LINK_TOKEN_EXPIRATION_DURATION_IN_MINUTES,
  );

  if (isTokenExpired) {
    throw new InvalidMagicLinkError();
  }

  return await update(user.id, {
    email_verified: true,
    email_verified_at: new Date(),
    magic_link_token: null,
    magic_link_sent_at: null,
  });
};

export const sendResetPasswordEmail = async (
  email: string,
  host: string,
): Promise<boolean> => {
  const user = await findByEmail(email);

  if (isEmpty(user)) {
    // failing silently as we do not want to give info on whether the user exists or not
    return true;
  }

  const resetPasswordToken = await generateToken();

  await update(user.id, {
    reset_password_token: resetPasswordToken,
    reset_password_sent_at: new Date(),
  });

  await sendMail({
    to: [user.email],
    subject: "Instructions pour la réinitialisation du mot de passe",
    html: ResetPassword({
      baseurl: host,
      reset_password_link: `${host}/users/change-password?reset_password_token=${resetPasswordToken}`,
    }).toString(),
    tag: "reset-password",
  });

  return true;
};

export const changePassword = async (
  token: string,
  password: string,
): Promise<User> => {
  // check that token as not the default empty value as it will match all users
  if (!token) {
    throw new InvalidTokenError();
  }

  const user = await findByResetPasswordToken(token);

  if (isEmpty(user)) {
    throw new InvalidTokenError();
  }

  const isTokenExpired = isExpired(
    user.reset_password_sent_at,
    RESET_PASSWORD_TOKEN_EXPIRATION_DURATION_IN_MINUTES,
  );

  if (isTokenExpired) {
    throw new InvalidTokenError();
  }

  if (!isPasswordSecure(password, user.email)) {
    throw new WeakPasswordError();
  }

  if (await hasPasswordBeenPwned(password)) {
    throw new LeakedPasswordError();
  }

  const hashedPassword = await hashPassword(password);

  return await update(user.id, {
    encrypted_password: hashedPassword,
    email_verified: true,
    email_verified_at: new Date(),
    reset_password_token: null,
    reset_password_sent_at: null,
  });
};

export const updatePersonalInformationsForRegistration = async (
  userId: number,
  {
    given_name,
    family_name,
    phone_number,
  }: Pick<User, "given_name" | "family_name" | "phone_number">,
): Promise<User> => {
  const isUserVerified = await getFranceConnectUserInfo(userId);
  const names = isUserVerified ? {} : { given_name, family_name };

  return update(userId, {
    ...names,
    phone_number,
  });
};

export const updatePersonalInformationsForDashboard = async (
  userId: number,
  {
    given_name,
    family_name,
    phone_number,
    job,
  }: Pick<User, "given_name" | "family_name" | "phone_number" | "job">,
): Promise<User> => {
  const isUserVerified = await getFranceConnectUserInfo(userId);
  const names = isUserVerified ? {} : { given_name, family_name };

  return update(userId, {
    ...names,
    phone_number,
    job,
  });
};

export async function isUserVerifiedWithFranceconnect(userId: number) {
  const userFranceConnect = await getFranceConnectUserInfo(userId);

  if (isEmpty(userFranceConnect)) {
    return false;
  }

  return !isExpired(
    userFranceConnect.updated_at,
    FRANCECONNECT_VERIFICATION_MAX_AGE_IN_MINUTES,
  );
}

export async function updateFranceConnectUserInfo(
  userId: number,
  userInfo: FranceConnectUserInfoResponse,
) {
  const { family_name, given_name } = userInfo;
  const user = await update(userId, { family_name, given_name });
  await upsetFranceconnectUserinfo({
    ...userInfo,
    user_id: userId,
  });
  return user;
}

export async function getUserVerificationLabel(userId: number) {
  const [, franceconnectUserinfo] = await to(getFranceConnectUserInfo(userId));

  if (franceconnectUserinfo) {
    undefined;
    return "FranceConnect";
  }

  return undefined;
}
