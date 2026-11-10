import { QuitOrganization } from "@proconnect-gouv/proconnect.email";
import {
  moderations,
  organizations,
} from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { NotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import { ModerationTypeSchema } from "@proconnect-gouv/proconnect.identite/types";
import { and, eq, isNull } from "drizzle-orm";
import type { Request } from "express";
import { isEmpty } from "lodash-es";
import { context, db, runtime } from "../../connectors/context";
import { sendMail } from "../../connectors/mail";
import {
  getUserFromAuthenticatedSession,
  setSelectedOrganizationIdInAuthenticatedSession,
} from "../session/authenticated";

const { organizations: organizationsRepository, users } = context.repository;

export const getUserOrganizations = async (userId: number) => {
  const userOrganizations = await organizationsRepository.findByUserId(userId);
  const pendingUserOrganizations = await db
    .select({
      cached_adresse: organizations.cached_adresse,
      cached_libelle: organizations.cached_libelle,
      cached_libelle_activite_principale:
        organizations.cached_libelle_activite_principale,
      cached_siege_social: organizations.cached_siege_social,
      id: organizations.id,
      moderation_id: moderations.id,
      siret: organizations.siret,
    })
    .from(moderations)
    .innerJoin(organizations, eq(organizations.id, moderations.organization_id))
    .where(
      and(
        eq(moderations.user_id, userId),
        eq(moderations.type, ModerationTypeSchema.enum.organization_join_block),
        isNull(moderations.moderated_at),
      ),
    )
    .orderBy(moderations.created_at);

  return { userOrganizations, pendingUserOrganizations };
};
export const quitOrganization = async ({
  user_id,
  organization_id,
}: {
  user_id: number;
  organization_id: number;
}) => {
  const organization = await organizationsRepository.findById(organization_id);

  if (isEmpty(organization)) {
    throw new NotFoundError();
  }

  const { kind } = await runtime
    .as({ type: "user", user_id })
    .removeMembership({ organization_id, user_id });

  if (kind === "membership_not_found") {
    throw new NotFoundError();
  }

  const { given_name, family_name, email } = await users.getById(user_id);

  await sendMail({
    to: [email],
    subject: "Vous avez quitté une organisation sur ProConnect",
    html: QuitOrganization({
      given_name: given_name ?? "",
      family_name: family_name ?? "",
      organization_label: organization.cached_libelle || organization.siret,
    }).toString(),
    tag: "quit-organization",
  });

  return true;
};

export const selectOrganization = async ({
  req,
  organization_id,
}: {
  req: Request;
  organization_id: number;
}) => {
  const { id: user_id } = getUserFromAuthenticatedSession(req);
  const userOrganizations = await organizationsRepository.findByUserId(user_id);
  const organization = userOrganizations.find(
    ({ id }) => id === organization_id,
  );

  if (isEmpty(organization)) {
    throw new NotFoundError();
  }

  setSelectedOrganizationIdInAuthenticatedSession(req, organization_id);
};
