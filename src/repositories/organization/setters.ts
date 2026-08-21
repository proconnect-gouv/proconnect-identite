import { context } from "../../connectors/context";

export const { deleteUserOrganization, linkUserToOrganization, upsert } =
  context.repository.organizations;

export const { update: updateUserOrganizationLink } =
  context.repository.users_organizations;
