//

import type { IdentiteDatabase } from "#src/database";
import { createIdentiteRuntime } from "#src/runtime";
import { createTestDatabase, readActivityLogs } from "#testing";
import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

//

async function setup() {
  const db = await createTestDatabase();
  await db.insert(schema.organizations).values([
    { id: 1, siret: "🦁" },
    { id: 2, siret: "🐺" },
  ]);
  await db.insert(schema.users).values([
    {
      created_at: "4444-04-04",
      email: "lion.eljonson@darkangels.world",
      id: 1,
      updated_at: "4444-04-04",
    },
    {
      created_at: "4444-04-04",
      email: "azrael@darkangels.world",
      id: 2,
      updated_at: "4444-04-04",
    },
  ]);
  await db.insert(schema.users_organizations).values([
    {
      is_external: true,
      organization_id: 1,
      user_id: 1,
      verification_type: "domain_not_verified_yet",
    },
    { organization_id: 1, user_id: 2, verification_type: "domain" },
    { organization_id: 2, user_id: 1, verification_type: "domain" },
  ]);

  return {
    db,
    runtime: createIdentiteRuntime({ app: "proconnect-identite", db }).as({
      type: "user",
      user_id: 1,
    }),
  };
}

describe("removeMembership", () => {
  it("✅ removes the membership and journals it under the user", async () => {
    const { db, runtime } = await setup();

    const outcome = await runtime.removeMembership({
      organization_id: 1,
      user_id: 1,
    });

    assert.deepEqual(outcome, {
      kind: "member_removed",
      activity_id: 1,
      previous: {
        is_external: true,
        verification_type: "domain_not_verified_yet",
      },
    });
    assert.deepEqual(await memberships(db), [
      { organization_id: 1, user_id: 2 },
      { organization_id: 2, user_id: 1 },
    ]);
    assert.deepEqual(await readActivityLogs(db), [
      {
        action: "member.removed",
        actor_ref: "1",
        actor_type: "user",
        app: "proconnect-identite",
        cause_activity_id: null,
        context: {
          inputs: {},
          outcome: {
            is_external: true,
            verification_type: "domain_not_verified_yet",
          },
        },
        interaction_cid: null,
        moderation_id: null,
        organization_id: 1,
        user_id: 1,
      },
    ]);
  });

  it("❎ returns membership_not_found and journals nothing for a missing link", async () => {
    const { db, runtime } = await setup();
    const before = await memberships(db);

    const outcome = await runtime.removeMembership({
      organization_id: 1,
      user_id: 999,
    });

    assert.deepEqual(outcome, {
      kind: "membership_not_found",
      organization_id: 1,
      user_id: 999,
    });
    assert.deepEqual(await memberships(db), before);
    assert.deepEqual(await readActivityLogs(db), []);
  });
});

function memberships(db: IdentiteDatabase) {
  return db.query.users_organizations.findMany({
    columns: { organization_id: true, user_id: true },
    orderBy: (table, { asc }) => [
      asc(table.organization_id),
      asc(table.user_id),
    ],
  });
}
