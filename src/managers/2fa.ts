import { MULTIPLE_2FA_SUGGESTION_RENEWAL_IN_MINUTES } from "../config/env";
import { UserIsNot2faCapableError } from "../config/errors";
import { context } from "../connectors/context";
import { isExpired } from "../services/is-expired";
import { isTotpConfiguredForUser } from "./totp";
import {
  countWebauthnAuthenticatorsForUser,
  isWebauthnConfiguredForUser,
} from "./webauthn";

const { users } = context.repository;

export const shouldForce2faForUser = async (user_id: number) => {
  const user = await users.getById(user_id);
  return user.force_2fa;
};

export const is2FACapable = async (user_id: number) => {
  if (await isTotpConfiguredForUser(user_id)) {
    return true;
  }

  if (await isWebauthnConfiguredForUser(user_id)) {
    return true;
  }

  return false;
};
export const countConfiguredTwoFactorAuthMethods = async (user_id: number) => {
  const [hasTotp, webauthnCount] = await Promise.all([
    isTotpConfiguredForUser(user_id),
    countWebauthnAuthenticatorsForUser(user_id),
  ]);

  return (hasTotp ? 1 : 0) + webauthnCount;
};

export const hasOnlyOneTwoFactorAuthMethodConfigured = async (
  user_id: number,
) => {
  return (await countConfiguredTwoFactorAuthMethods(user_id)) === 1;
};

export const disableForce2fa = async (user_id: number) => {
  // ASSERTION: user exists
  await users.getById(user_id);

  return await users.update(user_id, { force_2fa: false });
};

export const enableForce2fa = async (user_id: number) => {
  // ASSERTION: user exists
  await users.getById(user_id);

  if (!(await is2FACapable(user_id))) {
    throw new UserIsNot2faCapableError();
  }

  return await users.update(user_id, { force_2fa: true });
};
export const getConfiguredMethodLabel = async (
  user_id: number,
): Promise<string> => {
  const [hasTotp, hasWebauthn] = await Promise.all([
    isTotpConfiguredForUser(user_id),
    isWebauthnConfiguredForUser(user_id),
  ]);

  if (hasTotp && hasWebauthn) {
    return "l'application d'authentification (TOTP) et une clé de sécurité ou une passkey";
  }

  if (hasTotp) {
    return "l'application d'authentification (TOTP)";
  }

  if (hasWebauthn) {
    return "une clé de sécurité ou une passkey";
  }

  return "votre méthode de double authentification";
};

export const needsMultipleTwoFactorsSuggestionRenewal = async (
  user_id: number,
) => {
  const user = await users.getById(user_id);

  if (!user.multiple_2fa_suggestion_ignored_at) {
    return true;
  }

  return isExpired(
    user.multiple_2fa_suggestion_ignored_at,
    MULTIPLE_2FA_SUGGESTION_RENEWAL_IN_MINUTES,
  );
};

export const ignoreMultipleTwoFactorsSuggestion = async (user_id: number) => {
  // ASSERTION: user exists
  await users.getById(user_id);

  return await users.update(user_id, {
    multiple_2fa_suggestion_ignored_at: new Date(),
  });
};
