import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { sql } from "drizzle-orm";
import type { PgDatabase } from "drizzle-orm/pg-core";

export type TestDatabase = PgDatabase<any, typeof schema>;

export async function empty_database(database: TestDatabase) {
  await database.execute(sql`
    TRUNCATE TABLE
      activity_logs,
      authenticators,
      email_deliverability_whitelist,
      email_domains,
      franceconnect_userinfo,
      moderations,
      official_contact_email_verifications,
      oidc_clients,
      organizations,
      recovery_words,
      users,
      users_organizations,
      users_oidc_clients
    RESTART IDENTITY CASCADE
  `);
}

export async function insert_email_domain(
  database: TestDatabase,
  {
    domain,
    organization_id,
    verification_type,
  }: {
    domain: string;
    organization_id: number;
    verification_type: string;
  },
) {
  await database
    .insert(schema.email_domains)
    .values({ domain, organization_id, verification_type });
}

export async function insert_membership(
  database: TestDatabase,
  {
    organization_id,
    user_id,
    verification_type = "domain",
  }: {
    organization_id: number;
    user_id: number;
    verification_type?: string;
  },
) {
  await database
    .insert(schema.users_organizations)
    .values({ organization_id, user_id, verification_type });
}

export async function insert_organization(
  database: TestDatabase,
  {
    cached_adresse,
    cached_est_active = true,
    cached_libelle,
    cached_siege_social,
    siret,
  }: {
    cached_adresse?: string;
    cached_est_active?: boolean;
    cached_libelle?: string;
    cached_siege_social?: boolean;
    siret: string;
  },
) {
  const [{ id }] = await database
    .insert(schema.organizations)
    .values({
      cached_adresse,
      cached_est_active,
      cached_libelle,
      cached_siege_social,
      siret,
    })
    .returning({ id: schema.organizations.id });

  return id;
}

export async function insert_user(
  database: TestDatabase,
  { email, email_verified = true }: { email: string; email_verified?: boolean },
) {
  const [{ id }] = await database
    .insert(schema.users)
    .values({
      created_at: new Date().toISOString(),
      email,
      email_verified,
      email_verified_at: email_verified ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .returning({ id: schema.users.id });

  return id;
}
