//

import { PGlite } from "@electric-sql/pglite";
import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { migrate as migratePglite } from "@proconnect-gouv/proconnect.identite.database/pglite/migrator";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";

//

export const client = new PGlite();
export const db = drizzle(client, { schema });

export async function migrate() {
  await migratePglite(client);
  await db.execute(sql`SET search_path TO public`);
}

export async function emptyDatabase() {
  await db.execute(sql`
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

//

export async function insertOrganization({
  cached_est_active = true,
  siret,
}: {
  cached_est_active?: boolean;
  siret: string;
}) {
  const [{ id }] = await db
    .insert(schema.organizations)
    .values({ cached_est_active, siret })
    .returning({ id: schema.organizations.id });

  return id;
}

export async function insertEmailDomain({
  domain,
  organization_id,
  verification_type,
}: {
  domain: string;
  organization_id: number;
  verification_type: string;
}) {
  await db
    .insert(schema.email_domains)
    .values({ domain, organization_id, verification_type });
}

export async function insertUser({ email }: { email: string }) {
  const [{ id }] = await db
    .insert(schema.users)
    .values({
      created_at: new Date().toISOString(),
      email,
      updated_at: new Date().toISOString(),
    })
    .returning({ id: schema.users.id });

  return id;
}

export async function insertMembership({
  organization_id,
  user_id,
  verification_type = "domain",
}: {
  organization_id: number;
  user_id: number;
  verification_type?: string;
}) {
  await db
    .insert(schema.users_organizations)
    .values({ organization_id, user_id, verification_type });
}
