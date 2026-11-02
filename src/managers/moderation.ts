import { CancelModeration } from "@proconnect-gouv/proconnect.email";
import {
  ModerationNotFoundError,
  NotFoundError,
} from "@proconnect-gouv/proconnect.identite/errors";
import {
  ModerationTypeSchema,
  type User,
} from "@proconnect-gouv/proconnect.identite/types";
import { moderations as moderations_table } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { eq } from "drizzle-orm";
import { isEmpty } from "lodash-es";
import { ForbiddenError } from "../config/errors";
import { context, db, runtime } from "../connectors/context";
import { sendMail } from "../connectors/mail";
import { cancelModerationRecord } from "../usecases/moderation/cancel-moderation";

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

  if (moderation.moderated_at !== null) {
    throw new ModerationNotFoundError(`Moderation ${moderation_id} not found`);
  }

  await cancelModerationRecord({
    db,
    moderation_id,
    organization_id: moderation.organization_id,
    status: moderation.status,
    user_id: user.id,
  });

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

  return true;
};

export const reopenModerationWithUserEdit = async ({
  user,
  moderation_id,
}: {
  user: User;
  moderation_id: number;
}) => {
  const [moderation] = await db
    .select({
      organization_id: moderations_table.organization_id,
      sp_name: moderations_table.sp_name,
      type: moderations_table.type,
      user_id: moderations_table.user_id,
    })
    .from(moderations_table)
    .where(eq(moderations_table.id, moderation_id));

  if (!moderation) {
    throw new ModerationNotFoundError(`Moderation ${moderation_id} not found`);
  }

  if (user.id !== moderation.user_id) {
    throw new ForbiddenError();
  }

  const outcome = await runtime
    .as({ type: "user", user_id: user.id })
    .openModeration({
      organization_id: moderation.organization_id,
      sp_name: moderation.sp_name,
      ticket_id: null,
      type: ModerationTypeSchema.parse(moderation.type),
      user_id: user.id,
    });

  return outcome.moderation;
};
