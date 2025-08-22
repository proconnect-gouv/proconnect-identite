import { UserIsNot2faCapableError } from "../config/errors";
import { getById, update } from "../repositories/user";
import { isTotpConfiguredForUser } from "./totp";
import { isWebauthnConfiguredForUser } from "./webauthn";

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
