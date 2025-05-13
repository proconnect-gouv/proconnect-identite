import { upsertFactory } from "@gouvfr-lasuite/proconnect.identite/repositories/organization";
import { updateUserOrganizationLinkFactory } from "@gouvfr-lasuite/proconnect.identite/repositories/user";
import type { UserOrganizationLink } from "@gouvfr-lasuite/proconnect.identite/types";
import type { QueryResult } from "pg";
import { getDatabaseConnection } from "../../connectors/postgres";

export const upsert = upsertFactory({ pg: getDatabaseConnection() });

export const linkUserToOrganization = async ({
  organization_id,
  user_id,
  is_external = false,
  verification_type,
  needs_official_contact_email_verification = false,
}: {
  organization_id: number;
  user_id: number;
  is_external?: boolean;
  verification_type: UserOrganizationLink["verification_type"];
  needs_official_contact_email_verification?: UserOrganizationLink["needs_official_contact_email_verification"];
}): Promise<UserOrganizationLink> => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<UserOrganizationLink> = await connection.query(
    `
INSERT INTO users_organizations
    (user_id,
     organization_id,
     is_external,
     verification_type,
     needs_official_contact_email_verification,
     updated_at,
     created_at)
VALUES
    ($1, $2, $3, $4, $5, $6, $7)
RETURNING *`,
    [
      user_id,
      organization_id,
      is_external,
      verification_type,
      needs_official_contact_email_verification,
      new Date(),
      new Date(),
    ],
  );

  return rows.shift()!;
};

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
