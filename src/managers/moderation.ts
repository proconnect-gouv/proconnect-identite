import { CancelModeration } from "@proconnect-gouv/proconnect.email";
import { NotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import type { User } from "@proconnect-gouv/proconnect.identite/types";
import { isEmpty } from "lodash-es";
import { ForbiddenError } from "../config/errors";
import { context } from "../connectors/context";
import { sendMail } from "../connectors/mail";

const { moderations, organizations } = context.repository;

export const getOrganizationFromModeration = async ({
  user,
  moderation_id,
}: {
  user: User;
  moderation_id: number;
}) => {
  const moderation = await moderations.findById(moderation_id);

  if (isEmpty(moderation)) {
    throw new NotFoundError();
  }

  const organization = await organizations.findById(moderation.organization_id);
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
  const moderation = await moderations.getById(moderation_id);

  if (user.id !== moderation.user_id) {
    throw new ForbiddenError();
  }

  const organization = await organizations.findById(moderation.organization_id);
  if (!organization) {
    throw new NotFoundError();
  }

  const result = await moderations.delete(moderation_id);

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
  const moderation = await moderations.getById(moderation_id);

  if (user.id !== moderation.user_id) {
    throw new ForbiddenError();
  }

  return await moderations.reopen({
    id: moderation_id,
    userEmail: user.email,
    cause: "Edition des informations personnelles",
  });
};
