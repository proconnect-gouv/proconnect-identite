import { FORCE_2FA_FOR_SIRETS } from "../config/env";
import { context } from "../connectors/context";
import { isTotpConfiguredForUser } from "./totp";
import { isWebauthnConfiguredForUser } from "./webauthn";

const { organizations, users } = context.repository;

export const shouldForce2faForUser = async (user_id: number) => {
  const user = await users.getById(user_id);
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
