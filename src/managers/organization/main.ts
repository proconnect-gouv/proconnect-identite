import { NotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import { markDomainAsVerifiedFactory } from "@proconnect-gouv/proconnect.identite/managers/organization";
import type { Organization } from "@proconnect-gouv/proconnect.identite/types";
import { isEmpty } from "lodash-es";
import { context } from "../../connectors/context";
import { setSelectedOrganizationId } from "../../repositories/redis/selected-organization";

const { organizations, users_organizations } = context.repository;

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
  const hasBeenRemoved = await users_organizations.delete({
    user_id,
    organization_id,
  });

  if (!hasBeenRemoved) {
    throw new NotFoundError();
  }

  return true;
};

export const markDomainAsVerified = markDomainAsVerifiedFactory(context);

export const selectOrganization = async ({
  user_id,
  organization_id,
}: {
  user_id: number;
  organization_id: number;
}) => {
  const userOrganizations = await organizations.findByUserId(user_id);
  const organization = userOrganizations.find(
    ({ id }) => id === organization_id,
  );

  if (isEmpty(organization)) {
    throw new NotFoundError();
  }

  await setSelectedOrganizationId(user_id, organization_id);
};
