//

import { PGlite } from "@electric-sql/pglite";
import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { migrate as migratePglite } from "@proconnect-gouv/proconnect.identite.database/pglite/migrator";
import {
  createIdentiteRuntime,
  type Procedures,
} from "@proconnect-gouv/proconnect.identite.runtime";
import { sql } from "drizzle-orm";
import { drizzle, type PgliteDatabase } from "drizzle-orm/pglite";

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
      created_at: new Date(),
      email,
      updated_at: new Date(),
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

export async function given<AppProcedures extends Procedures>({
  procedures,
}: {
  procedures: AppProcedures &
    Parameters<
      typeof createIdentiteRuntime<{}, AppProcedures>
    >[0]["procedures"];
}): Promise<{
  db: PgliteDatabase<typeof schema> & { $client: PGlite };
  journal: () => Promise<
    Omit<typeof schema.activity_logs.$inferSelect, "created_at" | "id">[]
  >;
  runtime: ReturnType<
    ReturnType<typeof createIdentiteRuntime<{}, AppProcedures>>["as"]
  >;
}> {
  const pg = new PGlite();
  await migratePglite(pg);
  const db = drizzle(pg, { schema });
  await db.execute(sql`SET search_path TO public`);
  await db.insert(schema.users).values({
    created_at: new Date("4444-04-04"),
    email: "jean.valjean@republic.fr",
    id: 1,
    updated_at: new Date("4444-04-04"),
  });

  return {
    db,
    journal: () =>
      db.query.activity_logs.findMany({
        columns: { created_at: false, id: false },
        orderBy: (table, { asc }) => asc(table.id),
      }),
    runtime: createIdentiteRuntime<{}, AppProcedures>({
      app: "proconnect-identite",
      db,
      procedures,
    }).as({ type: "user", user_id: 1 }),
  };
}

export function userActivity(
  action: string,
  context: unknown,
  targets: { moderation_id?: number; organization_id?: number } = {},
) {
  return {
    action,
    actor_ref: "1",
    actor_type: "user",
    app: "proconnect-identite",
    cause_activity_id: null,
    context,
    interaction_cid: null,
    moderation_id: targets.moderation_id ?? null,
    organization_id: targets.organization_id ?? null,
    user_id: 1,
  };
}
