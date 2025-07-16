import {
  NotFoundError,
  UserNotFoundError,
} from "@gouvfr-lasuite/proconnect.identite/errors";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  type VerifiedAuthenticationResponse,
  type VerifiedRegistrationResponse,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/types";
import { isEmpty } from "lodash-es";
import moment from "moment";
import "moment-timezone";
import { APPLICATION_NAME, HOST, WEBSITE_IDENTIFIER } from "../config/env";
import {
  WebauthnAuthenticationFailedError,
  WebauthnRegistrationFailedError,
} from "../config/errors";
import { getAuthenticatorFriendlyName } from "../connectors/github-passkey-authenticator-aaguids";
import {
  createAuthenticator,
  deleteAuthenticator,
  findAuthenticator,
  getAuthenticatorsByUserId,
  updateAuthenticator,
} from "../repositories/authenticator";
import {
  findByEmail as findUserByEmail,
  getById,
  update,
} from "../repositories/user";
import { encodeBase64URL } from "../services/base64";
import { logger } from "../services/log";
import { disableForce2fa, enableForce2fa, is2FACapable } from "./2fa";

// Human-readable title for your website
const rpName = APPLICATION_NAME;
// A unique identifier for your website
const rpID = WEBSITE_IDENTIFIER;
// The URL at which registrations and authentications should occur
const origin = HOST;

export const isWebauthnConfiguredForUser = async (user_id: number) => {
  // ASSERTION: user exists
  await getById(user_id);

  const authenticators = await getAuthenticatorsByUserId(user_id);
  return !isEmpty(authenticators);
};

export const getUserAuthenticators = async (email: string) => {
  const user = await findUserByEmail(email);

  if (isEmpty(user)) {
    throw new NotFoundError();
  }

  const userAuthenticators = await getAuthenticatorsByUserId(user.id);

  return userAuthenticators.map(
    ({
      credential_id,
      usage_count,
      display_name,
      created_at,
      last_used_at,
      user_verified,
    }) => ({
      credential_id: encodeBase64URL(credential_id),
      usage_count,
      display_name:
        display_name ||
        `Clé ${encodeBase64URL(credential_id).substring(0, 10)}`,
      created_at: moment(created_at).tz("Europe/Paris").locale("fr").calendar(),
      last_used_at: last_used_at
        ? moment(last_used_at).tz("Europe/Paris").locale("fr").calendar()
        : "pas encore utilisée",
      shows_second_factor_only_label: !user_verified,
    }),
  );
};

export const deleteUserAuthenticator = async (
  email: string,
  credential_id: string,
) => {
  const user = await findUserByEmail(email);

  if (isEmpty(user)) {
    throw new NotFoundError();
  }

  const hasBeenDeleted = await deleteAuthenticator(user.id, credential_id);

  if (!hasBeenDeleted) {
    throw new NotFoundError();
  }

  if (!(await is2FACapable(user.id))) {
    await disableForce2fa(user.id);
  }

  return true;
};

export const getRegistrationOptions = async (email: string) => {
  const user = await findUserByEmail(email);

  if (isEmpty(user)) {
    throw new NotFoundError();
  }

  // Retrieve any of the user's previously-registered authenticators
  const userAuthenticators = await getAuthenticatorsByUserId(user.id);

  const registrationOptions = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: user.id.toString(10),
    userName: user.email,
    // Don't prompt users for additional information about the authenticator
    // (Recommended for smoother UX)
    attestationType: "none",
    // Prevent users from re-registering existing authenticators
    excludeCredentials: userAuthenticators.map((authenticator) => ({
      id: authenticator.credential_id,
      type: "public-key",
      // Optional
      transports: authenticator.transports || [],
    })),
    authenticatorSelection: {
      // Will always generate synced passkeys on Android devices,
      // but will consume discoverable credential slots on security keys.
      residentKey: "preferred",
      // Will perform user verification when possible,
      // but will skip any prompts for PIN or local login password when possible.
      // In these instances, user verification can sometimes be false.
      userVerification: "preferred",
    },
  });

  // Remember the challenge for this user
  const updatedUser = await update(user.id, {
    current_challenge: registrationOptions.challenge,
  });

  return { updatedUser, registrationOptions };
};

export const verifyRegistration = async ({
  email,
  response,
  force_2fa,
}: {
  email: string;
  response: RegistrationResponseJSON;
  force_2fa: boolean;
}) => {
  const user = await findUserByEmail(email);

  if (isEmpty(user) || !user.current_challenge) {
    throw new NotFoundError();
  }

  const current_challenge = user.current_challenge;
  // challenge must only be used once
  await update(user.id, { current_challenge: null });

  let verification: VerifiedRegistrationResponse;
  try {
    verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: current_challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      // do not enforce user verification by the authenticator (via PIN, fingerprint, etc...)
      // to authorize usage of fido u2f security keys
      requireUserVerification: false,
    });
  } catch (error) {
    logger.error(error);
    throw new WebauthnRegistrationFailedError();
  }

  const { verified, registrationInfo } = verification;

  if (!verified || isEmpty(registrationInfo)) {
    throw new WebauthnRegistrationFailedError();
  }

  const {
    aaguid,
    credentialPublicKey: credential_public_key,
    credentialID: credential_id,
    counter,
    credentialDeviceType: credential_device_type,
    credentialBackedUp: credential_backed_up,
    userVerified: user_verified,
  } = registrationInfo;

  const display_name = await getAuthenticatorFriendlyName(aaguid);

  // Save the authenticator info so that we can get it by user ID later
  await createAuthenticator({
    user_id: user.id,
    authenticator: {
      credential_id,
      credential_public_key,
      counter,
      credential_device_type,
      credential_backed_up,
      transports: response.response.transports as
        | AuthenticatorTransport[]
        | undefined,
      display_name,
      last_used_at: null,
      usage_count: 0,
      user_verified,
    },
  });
  const updatedUser = force_2fa
    ? await enableForce2fa(user.id)
    : await disableForce2fa(user.id);

  return { userVerified: user_verified, user: updatedUser };
};

export const getAuthenticationOptions = async (
  email: string | undefined,
  isSecondFactorAuthentication: boolean,
) => {
  if (!email) {
    throw new NotFoundError();
  }

  const user = await findUserByEmail(email);

  if (isEmpty(user)) {
    throw new UserNotFoundError();
  }

  // Retrieve any of the user's previously registered authenticators
  const userAuthenticators = await getAuthenticatorsByUserId(user.id);

  const authenticationOptions = await generateAuthenticationOptions({
    rpID,
    // Require users to use a previously registered authenticator
    allowCredentials: userAuthenticators.map((authenticator) => ({
      id: authenticator.credential_id,
      type: "public-key",
      transports: authenticator.transports || [],
    })),
    userVerification: isSecondFactorAuthentication ? "discouraged" : "required",
  });

  // Remember the challenge for this user
  const updatedUser = await update(user.id, {
    current_challenge: authenticationOptions.challenge,
  });

  return { updatedUser, authenticationOptions };
};

export const verifyAuthentication = async ({
  email,
  response,
  isSecondFactorVerification,
}: {
  email: string | undefined;
  response: AuthenticationResponseJSON;
  isSecondFactorVerification: boolean;
}) => {
  if (!email) {
    throw new NotFoundError();
  }

  const user = await findUserByEmail(email);

  if (isEmpty(user) || !user.current_challenge) {
    throw new NotFoundError();
  }

  const current_challenge = user.current_challenge;
  // challenge must only be used once
  await update(user.id, { current_challenge: null });

  // Retrieve an authenticator from the DB that should match the `id` in the returned credential
  const authenticator = await findAuthenticator(user.id, response.id);

  if (isEmpty(authenticator)) {
    throw new NotFoundError();
  }

  const {
    credential_public_key: credentialPublicKey,
    credential_id: credentialID,
    counter,
    transports,
  } = authenticator;

  let verification: VerifiedAuthenticationResponse;
  try {
    verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: current_challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialPublicKey,
        credentialID,
        counter,
        transports,
      },
      // do not enforce user verification by the authenticator (via PIN, fingerprint, etc...)
      // to authorize usage of fido u2f security keys for second factor authentication
      requireUserVerification: !isSecondFactorVerification,
    });
  } catch (error) {
    logger.error(error);
    throw new WebauthnAuthenticationFailedError();
  }

  const { verified, authenticationInfo } = verification;

  if (!verified || isEmpty(authenticationInfo)) {
    throw new WebauthnAuthenticationFailedError();
  }

  const {
    credentialID: newCredentialID,
    newCounter,
    userVerified,
  } = authenticationInfo;

  await updateAuthenticator(newCredentialID, {
    // for some reason, newCounter is not incremented in authenticationInfo
    counter: newCounter,
    last_used_at: new Date(),
    usage_count: authenticator.usage_count + 1,
  });

  return { userVerified, user };
};
