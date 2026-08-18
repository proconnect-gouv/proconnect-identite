import { NotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import type { User } from "@proconnect-gouv/proconnect.identite/types";
import { isEmpty } from "lodash-es";
import { ForbiddenError } from "../config/errors";
import { context } from "../connectors/context";
import { withTransaction } from "../connectors/postgres";
import {
  findModerationById,
  getModerationById,
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

  return withTransaction(async (client) => {
    const { repository } = context.createChild({ pg: client });
    await repository.moderations.delete(moderation_id);
    await repository.activity({
      action: "moderation_cancelled",
      context: { moderation_snapshot: moderation },
      actor_user_id: user.id,
      actor_email: user.email,
      actor_type: "user",
      target_type: "moderations",
      target_id: moderation_id,
    });
  });
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

  return withTransaction(async (client) => {
    const { repository } = context.createChild({ pg: client });
    const reopened = await repository.moderations.reopen({
      id: moderation_id,
      userEmail: user.email,
      cause: "Edition des informations personnelles",
    });
    await repository.activity({
      action: "moderation_reopened",
      context: {},
      actor_user_id: user.id,
      actor_email: user.email,
      actor_type: "user",
      target_type: "moderations",
      target_id: moderation_id,
    });
    return reopened;
  });
};
