import { QuitOrganization } from "@proconnect-gouv/proconnect.email";
import { NotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import type { Organization } from "@proconnect-gouv/proconnect.identite/types";
import type { Request } from "express";
import { isEmpty } from "lodash-es";
import { context, runtime } from "../../connectors/context";
import { sendMail } from "../../connectors/mail";
import {
  getUserFromAuthenticatedSession,
  setSelectedOrganizationIdInAuthenticatedSession,
} from "../session/authenticated";

const { organizations, users } = context.repository;

export const getUserOrganizations = async (
  userId: number,
): Promise<{
  userOrganizations: Organization[];
  pendingUserOrganizations: Organization[];
}> => {
  const userOrganizations = await organizations.findByUserId(userId);
  const pendingUserOrganizations =
    await organizations.findPendingByUserId(userId);

  return { userOrganizations, pendingUserOrganizations };
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
