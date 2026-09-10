import { MULTIPLE_2FA_SUGGESTION_RENEWAL_IN_MINUTES } from "../config/env";
import { UserIsNot2faCapableError } from "../config/errors";
import { context } from "../connectors/context";
import { isExpired } from "../services/is-expired";
import { isTotpConfiguredForUser } from "./totp";
import { isWebauthnConfiguredForUser } from "./webauthn";

const { getById, update } = context.repository.users;

export const shouldForce2faForUser = async (user_id: number) => {
  const user = await getById(user_id);
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
  const methods = await Promise.all([
    isTotpConfiguredForUser(user_id),
    isWebauthnConfiguredForUser(user_id),
  ]);

  return methods.filter(Boolean).length;
};

export const hasOnlyOneTwoFactorAuthMethodConfigured = async (
  user_id: number,
) => {
  return (await countConfiguredTwoFactorAuthMethods(user_id)) === 1;
};

export const disableForce2fa = async (user_id: number) => {
  // ASSERTION: user exists
  await getById(user_id);

  return await update(user_id, { force_2fa: false });
};

export const enableForce2fa = async (user_id: number) => {
  // ASSERTION: user exists
  await getById(user_id);

  if (!(await is2FACapable(user_id))) {
    throw new UserIsNot2faCapableError();
  }

  return await update(user_id, { force_2fa: true });
};
export const getConfiguredMethodLabel = async (
  user_id: number,
): Promise<string> => {
  if (await isTotpConfiguredForUser(user_id)) {
    return "l'application d'authentification (TOTP)";
  }

  if (await isWebauthnConfiguredForUser(user_id)) {
    return "une clé de sécurité ou un passkey";
  }

  return "votre méthode de double authentification";
};

export const needsMultipleTwoFactorsSuggestionRenewal = async (
  user_id: number,
) => {
  const user = await getById(user_id);

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
  await getById(user_id);

  return await update(user_id, {
    multiple_2fa_suggestion_ignored_at: new Date(),
  });
};
