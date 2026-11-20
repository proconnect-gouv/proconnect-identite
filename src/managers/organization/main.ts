import { QuitOrganization } from "@proconnect-gouv/proconnect.email";
import { NotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import { computeServicePublicInfo } from "@proconnect-gouv/proconnect.identite/services/organization";
import { ModerationTypeSchema } from "@proconnect-gouv/proconnect.identite/types";
import type { Request } from "express";
import { isEmpty } from "lodash-es";
import { context, db, runtime } from "../../connectors/context";
import { sendMail } from "../../connectors/mail";
import {
  getUserFromAuthenticatedSession,
  setSelectedOrganizationIdInAuthenticatedSession,
} from "../session/authenticated";

const { organizations, users } = context.repository;

export const getUserOrganizations = async (userId: number) => {
  const userOrganizations = await organizations.findByUserId(userId);
  const pendingModerations = await db.query.moderations.findMany({
    columns: { id: true },
    where: (table, { and, eq, isNull }) =>
      and(
        eq(table.user_id, userId),
        eq(table.type, ModerationTypeSchema.enum.organization_join_block),
        isNull(table.moderated_at),
      ),
    orderBy: (table, { asc }) => asc(table.created_at),
    with: { organization: true },
  });
  const pendingUserOrganizations = pendingModerations.map(
    ({ id: moderation_id, organization }) => ({
      ...organization,
      moderation_id,
    }),
  );

  return { userOrganizations, pendingUserOrganizations };
};

export const isUserInAdministrationEtat = async (
  user_id: number,
): Promise<boolean> => {
  const userOrganizations = await organizations.findByUserId(user_id);

  return userOrganizations.some(
    (organization) =>
      computeServicePublicInfo(organization).isAdministrationEtat === true,
  );
};
export const quitOrganization = async ({
  user_id,
  organization_id,
}: {
  user_id: number;
  organization_id: number;
}) => {
  const organization = await organizations.findById(organization_id);

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
  const userOrganizations = await organizations.findByUserId(user_id);
  const organization = userOrganizations.find(
    ({ id }) => id === organization_id,
  );

  if (isEmpty(organization)) {
    throw new NotFoundError();
  }

  setSelectedOrganizationIdInAuthenticatedSession(req, organization_id);
};
