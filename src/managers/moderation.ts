import { NotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import type { User } from "@proconnect-gouv/proconnect.identite/types";
import { isEmpty } from "lodash-es";
import { ForbiddenError } from "../config/errors";
import {
  deleteModeration,
  findModerationById,
  getModerationById,
  reopenModeration,
} from "../repositories/moderation";
import { findById as findOrganizationById } from "../repositories/organization/getters";

export const getOrganizationFromModeration = async ({
  user,
  moderation_id,
}: {
  user: User;
  moderation_id: number;
}) => {
  const moderation = await findModerationById(moderation_id);

  if (isEmpty(moderation)) {
    throw new NotFoundError();
  }

  const organization = await findOrganizationById(moderation.organization_id);
  if (!organization) {
    throw new NotFoundError();
  }

  if (user.id !== moderation.user_id) {
    throw new ForbiddenError();
  }

  return organization;
};

export const cancelModeration = async ({
  user,
  moderation_id,
}: {
  user: User;
  moderation_id: number;
}) => {
  const moderation = await getModerationById(moderation_id);

  if (user.id !== moderation.user_id) {
    throw new ForbiddenError();
  }

  return await deleteModeration(moderation_id);
};

export const reopenModerationWithUserEdit = async ({
  user,
  moderation_id,
}: {
  user: User;
  moderation_id: number;
}) => {
  const moderation = await getModerationById(moderation_id);

  if (user.id !== moderation.user_id) {
    throw new ForbiddenError();
  }

  return await reopenModeration({
    id: moderation_id,
    userEmail: user.email,
    cause: "Edition des informations personnelles",
  });
};
