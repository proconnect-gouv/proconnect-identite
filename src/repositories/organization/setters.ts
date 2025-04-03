import {
  linkUserToOrganizationFactory,
  upsertFactory,
} from "@gouvfr-lasuite/proconnect.identite/repositories/organization";
import { updateUserOrganizationLinkFactory } from "@gouvfr-lasuite/proconnect.identite/repositories/user";
import { getDatabaseConnection } from "../../connectors/postgres";

export const upsert = upsertFactory({ pg: getDatabaseConnection() });

export const linkUserToOrganization = linkUserToOrganizationFactory({
  pg: getDatabaseConnection(),
});

export const updateUserOrganizationLink = updateUserOrganizationLinkFactory({
  pg: getDatabaseConnection(),
});

export const deleteUserOrganization = async ({
  user_id,
  organization_id,
}: {
  user_id: number;
  organization_id: number;
}) => {
  const connection = getDatabaseConnection();

  const { rowCount } = await connection.query(
    `
DELETE FROM users_organizations
WHERE user_id = $1 AND organization_id = $2`,
    [user_id, organization_id],
  );

  return rowCount > 0;
};
