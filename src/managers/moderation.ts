import { CancelModeration } from "@proconnect-gouv/proconnect.email";
import { NotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import type { User } from "@proconnect-gouv/proconnect.identite/types";
import { isEmpty } from "lodash-es";
import { ForbiddenError } from "../config/errors";
import { context } from "../connectors/context";
import { sendMail } from "../connectors/mail";

const { findById: findOrganizationById } = context.repository.organizations;

const {
  delete: deleteModeration,
  findById: findModerationById,
  getById: getModerationById,
  reopen: reopenModeration,
} = context.repository.moderations;

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

  const organization = await findOrganizationById(moderation.organization_id);
  if (!organization) {
    throw new NotFoundError();
  }

  const result = await deleteModeration(moderation_id);

  await sendMail({
    to: [user.email],
    subject: "Annulation de votre demande de rattachement",
    html: CancelModeration({
      given_name: user.given_name ?? "",
      family_name: user.family_name ?? "",
      libelle: organization.cached_libelle || organization.siret,
    }).toString(),
    tag: "cancel-moderation",
  });

  return result;
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
