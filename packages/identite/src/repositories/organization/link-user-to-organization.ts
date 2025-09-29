import { hashToPostgresParams } from "#src/services/postgres";
import type {
  DatabaseContext,
  InsertUserOrganizationLink,
  UserOrganizationLink,
} from "#src/types";
import type { QueryResult } from "pg";

export function linkUserToOrganizationFactory({ pg }: DatabaseContext) {
  return async function linkUserToOrganization({
    is_external = false,
    needs_official_contact_email_verification = false,
    organization_id,
    user_id,
    verification_type,
  }: InsertUserOrganizationLink) {
    const { paramsString, valuesString, values } =
      hashToPostgresParams<UserOrganizationLink>({
        created_at: new Date(),
        is_external,
        needs_official_contact_email_verification,
        organization_id,
        updated_at: new Date(),
        user_id,
        verification_type,
        verified_at: verification_type ? new Date() : undefined,
      });

    const { rows }: QueryResult<UserOrganizationLink> = await pg.query(
      `
      INSERT INTO users_organizations
        ${paramsString}
      VALUES
        ${valuesString}
      RETURNING *;`,
      values,
    );

    return rows.shift()!;
  };
}

export type LinkUserToOrganizationHandler = ReturnType<
  typeof linkUserToOrganizationFactory
>;
