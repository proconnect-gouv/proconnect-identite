import { QuitOrganization } from "@proconnect-gouv/proconnect.email";
import { NotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import { markDomainAsVerifiedFactory } from "@proconnect-gouv/proconnect.identite/managers/organization";
import type { Organization } from "@proconnect-gouv/proconnect.identite/types";
import { isEmpty } from "lodash-es";
import { context } from "../../connectors/context";
import { sendMail } from "../../connectors/mail";
import { setSelectedOrganizationId } from "../../repositories/redis/selected-organization";

const {
  findBySiret,
  findByUserId,
  findById: findOrganizationById,
  findPendingByUserId,
  deleteUserOrganization,
} = context.repository.organizations;

const { getById: getUserById } = context.repository.users;

export const getOrganizationsByUserId = findByUserId;
export const getOrganizationById = findOrganizationById;
export const getOrganizationBySiret = findBySiret;
export const getUserOrganizations = async (
  userId: number,
): Promise<{
  userOrganizations: Organization[];
  pendingUserOrganizations: Organization[];
}> => {
  const userOrganizations = await getOrganizationsByUserId(userId);
  const pendingUserOrganizations = await findPendingByUserId(userId);

  return { userOrganizations, pendingUserOrganizations };
};
export const quitOrganization = async ({
  user_id,
  organization_id,
}: {
  user_id: number;
  organization_id: number;
}) => {
  const organization = await findOrganizationById(organization_id);

  if (isEmpty(organization)) {
    throw new NotFoundError();
  }

  const hasBeenRemoved = await deleteUserOrganization({
    user_id,
    organization_id,
  });

  if (!hasBeenRemoved) {
    throw new NotFoundError();
  }

  const { given_name, family_name, email } = await getUserById(user_id);

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

export const markDomainAsVerified = markDomainAsVerifiedFactory(context);

export const selectOrganization = async ({
  user_id,
  organization_id,
}: {
  user_id: number;
  organization_id: number;
}) => {
  const userOrganizations = await getOrganizationsByUserId(user_id);
  const organization = userOrganizations.find(
    ({ id }) => id === organization_id,
  );

  if (isEmpty(organization)) {
    throw new NotFoundError();
  }

  await setSelectedOrganizationId(user_id, organization_id);
};
