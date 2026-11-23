import type { activityContextSchemas } from "@proconnect-gouv/proconnect.identite.runtime";
import type { z } from "zod";
import { FORCE_2FA_FOR_SIRETS } from "../config/env";
import { UserIsNot2faCapableError } from "../config/errors";
import { context, runtime } from "../connectors/context";
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

type Force2faDisabledReason = z.output<
  (typeof activityContextSchemas)["user.force_2fa_disabled"]
>["inputs"]["reason"];

export const disableForce2fa = async (
  user_id: number,
  reason: Force2faDisabledReason,
) => {
  // ASSERTION: user exists
  const user = await users.getById(user_id);

  const outcome = await runtime
    .as({ type: "user", user_id })
    .user.force_2fa_disabled.mutate({ reason, user_id });

  return outcome.kind === "force_2fa_disabled" ? outcome.user : user;
};

export const enableForce2fa = async (user_id: number) => {
  // ASSERTION: user exists
  const user = await users.getById(user_id);

  if (!(await is2FACapable(user_id))) {
    throw new UserIsNot2faCapableError();
  }

  const outcome = await runtime
    .as({ type: "user", user_id })
    .user.force_2fa_enabled.mutate({ user_id });

  return outcome.kind === "force_2fa_enabled" ? outcome.user : user;
};
