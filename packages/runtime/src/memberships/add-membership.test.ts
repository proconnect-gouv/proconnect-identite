//

import type { RuntimeContext } from "#src/activity";
import type { IdentiteDatabase } from "#src/database";
import { createIdentiteRuntime } from "#src/runtime";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { migrate } from "@proconnect-gouv/proconnect.identite.database/pglite/migrator";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

//

const user_joining = {
  actor: { type: "user", user_id: 1 },
  app: "proconnect-identite",
} satisfies Pick<RuntimeContext, "actor" | "app">;

async function setup({ actor, app }: Pick<RuntimeContext, "actor" | "app">) {
  const pg = new PGlite();
  await migrate(pg);
  const db = drizzle(pg, { schema });
  await db.execute(sql`SET search_path TO public`);

  await db.insert(schema.organizations).values({
    cached_libelle: "Dark Angels",
    id: 1,
    siret: "🦁",
  });
  await db.insert(schema.users).values([
    {
      created_at: "4444-04-04",
      email: "jean.valjean@republic.fr",
      id: 1,
      updated_at: "4444-04-04",
    },
    {
      created_at: "4444-04-04",
      email: "cosette@republic.fr",
      id: 2,
      updated_at: "4444-04-04",
    },
  ]);
  await db.insert(schema.users_organizations).values({
    organization_id: 1,
    user_id: 2,
    verification_type: "domain",
  });

  return {
    db,
    runtime: createIdentiteRuntime({ app, db }).as(actor),
  };
}

describe("addMembership", () => {
  it("✅ adds the membership and journals it under the user", async () => {
    const { db, runtime } = await setup(user_joining);

    const outcome = await runtime.addMembership({
      is_external: true,
      organization_id: 1,
      user_id: 1,
      verification_type: "official_contact_email",
    });

    assert.deepEqual(outcome, {
      kind: "member_joined",
      activity_id: 1,
      membership: { organization_id: 1, user_id: 1 },
    });
    assert.deepEqual(await memberships(db), [
      {
        is_external: true,
        organization_id: 1,
        user_id: 1,
        verification_type: "official_contact_email",
      },
      {
        is_external: false,
        organization_id: 1,
        user_id: 2,
        verification_type: "domain",
      },
    ]);
    assert.deepEqual(await activityLogs(db), [
      {
        action: "member.joined",
        actor_ref: "1",
        actor_type: "user",
        app: "proconnect-identite",
        cause_activity_id: null,
        context: {
          inputs: {
            is_external: true,
            verification_type: "official_contact_email",
          },
          outcome: {},
        },
        interaction_cid: null,
        moderation_id: null,
        organization_id: 1,
        user_id: 1,
      },
    ]);
  });

  it("❎ returns member_already_exists and writes nothing for an existing link", async () => {
    const { db, runtime } = await setup(user_joining);
    const before = await memberships(db);

    const outcome = await runtime.addMembership({
      organization_id: 1,
      user_id: 2,
      verification_type: "official_contact_email",
    });

    assert.deepEqual(outcome, {
      kind: "member_already_exists",
      organization_id: 1,
      user_id: 2,
    });
    assert.deepEqual(await memberships(db), before);
    assert.deepEqual(await activityLogs(db), []);
  });
});

function memberships(db: IdentiteDatabase) {
  return db.query.users_organizations.findMany({
    columns: {
      is_external: true,
      organization_id: true,
      user_id: true,
      verification_type: true,
    },
    orderBy: (table, { asc }) => [
      asc(table.organization_id),
      asc(table.user_id),
    ],
  });
}

function activityLogs(db: IdentiteDatabase) {
  return db.query.activity_logs.findMany({
    columns: { created_at: false, id: false },
    orderBy: (table, { asc }) => asc(table.id),
  });
}
