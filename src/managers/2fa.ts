import { FORCE_2FA_FOR_SIRETS } from "../config/env";
import { UserIsNot2faCapableError } from "../config/errors";
import { context, db } from "../connectors/context";
import { disableForce2fa as disableForce2faUseCase } from "../usecases/user/disable-force-2fa";
import { enableForce2fa as enableForce2faUseCase } from "../usecases/user/enable-force-2fa";
import { isTotpConfiguredForUser } from "./totp";
import { isWebauthnConfiguredForUser } from "./webauthn";

const { organizations } = context.repository;

export const shouldForce2faForUser = async (user_id: number) => {
  const user = await context.repository.users.getById(user_id);
  return user.force_2fa;
};

export const doesOrganizationRequireForced2fa = async (
  organization_id: number,
) => {
  const organization = await organizations.findById(organization_id);
  if (!organization) return false;

  return FORCE_2FA_FOR_SIRETS.includes(organization.siret);
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
  return disableForce2faUseCase({ db, user_id });
};

export const enableForce2fa = async (user_id: number) => {
  const user = await context.repository.users.getById(user_id);

  if (!(await is2FACapable(user_id))) {
    throw new UserIsNot2faCapableError();
  }

  if (user.force_2fa) {
    return user;
  }

  return enableForce2faUseCase({ db, user_id });
};
