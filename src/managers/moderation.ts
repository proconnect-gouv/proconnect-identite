import { CancelModeration } from "@proconnect-gouv/proconnect.email";
import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import {
  ModerationNotFoundError,
  NotFoundError,
} from "@proconnect-gouv/proconnect.identite/errors";
import {
  ModerationStatusSchema,
  type User,
} from "@proconnect-gouv/proconnect.identite/types";
import { eq, sql } from "drizzle-orm";
import { isEmpty } from "lodash-es";
import { ForbiddenError } from "../config/errors";
import { context, db } from "../connectors/context";
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

  const rows = await db
    .delete(schema.moderations)
    .where(eq(schema.moderations.id, moderation_id))
    .returning({ id: schema.moderations.id });
  const result = rows.length > 0;
  if (!result) {
    throw new ModerationNotFoundError(`Moderation ${moderation_id} not found`);
  }

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

  const rows = await db
    .update(schema.moderations)
    .set({
      moderated_at: null,
      moderated_by: null,
      status: ModerationStatusSchema.enum.reopened,
      comment: sql`COALESCE(${schema.moderations.comment}, '') || ' | Réouvert le ' || NOW()::date || ' par ' || ${user.email} || ' - ' || ${"Edition des informations personnelles"}`,
    })
    .where(eq(schema.moderations.id, moderation_id))
    .returning();
  const reopened = rows.shift();
  if (!reopened) {
    throw new ModerationNotFoundError(`Moderation ${moderation_id} not found`);
  }

  return reopened;
};
