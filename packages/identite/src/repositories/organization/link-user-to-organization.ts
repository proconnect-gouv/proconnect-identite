import type { DatabaseContext, UserOrganizationLink } from "#src/types";
import type { QueryResult } from "pg";

export function linkUserToOrganizationFactory({ pg }: DatabaseContext) {
  return async function linkUserToOrganization({
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
  }) {
    const { rows }: QueryResult<UserOrganizationLink> = await pg.query(
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
        RETURNING *
      `,
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

    return rows.shift()! as UserOrganizationLink;
  };
}

export type LinkUserToOrganizationHandler = ReturnType<
  typeof linkUserToOrganizationFactory
>;
