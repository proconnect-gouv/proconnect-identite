//

import { createIdentiteRuntime } from "#src/runtime";
import { createTestDatabase, readActivityLogs } from "#testing";
import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

//

async function given() {
  const db = await createTestDatabase();

  await db.insert(schema.users).values([
    {
      created_at: "4444-04-04",
      email: "jean.valjean@republic.fr",
      family_name: "Valjean",
      given_name: "Jean",
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
  await db.insert(schema.organizations).values([
    {
      created_at: "4444-04-04",
      id: 1,
      siret: "11111111111111",
      updated_at: "4444-04-04",
    },
    {
      created_at: "4444-04-04",
      id: 2,
      siret: "22222222222222",
      updated_at: "4444-04-04",
    },
  ]);
  await db.insert(schema.users_organizations).values([
    {
      created_at: "4444-04-04",
      is_external: true,
      organization_id: 2,
      updated_at: "4444-04-04",
      user_id: 1,
      verification_type: "domain",
    },
    {
      created_at: "4444-04-04",
      is_external: false,
      organization_id: 1,
      updated_at: "4444-04-04",
      user_id: 1,
      verification_type: "official_contact_email",
    },
    {
      created_at: "4444-04-04",
      is_external: false,
      organization_id: 1,
      updated_at: "4444-04-04",
      user_id: 2,
      verification_type: "domain",
    },
  ]);

  return {
    journal: () => readActivityLogs(db),
    remainingUsers: () =>
      db.query.users.findMany({
        columns: { id: true },
        orderBy: (table, { asc }) => asc(table.id),
        with: {
          users_organizations: { columns: { organization_id: true } },
        },
      }),
    runtime: createIdentiteRuntime({ app: "proconnect-identite", db }).as({
      type: "user",
      user_id: 1,
    }),
  };
}

describe("user.deleted", () => {
  it("✅ deletes the account and journals who it was and which organizations it left", async () => {
    const { journal, remainingUsers, runtime } = await given();

    const outcome = await runtime.user.deleted.mutate({ user_id: 1 });

    const previous = {
      email: "jean.valjean@republic.fr",
      family_name: "Valjean",
      given_name: "Jean",
      memberships: [
        {
          is_external: false,
          organization_id: 1,
          verification_type: "official_contact_email",
        },
        { is_external: true, organization_id: 2, verification_type: "domain" },
      ],
    };
    assert.deepEqual(outcome, {
      activity_id: 1,
      kind: "user_deleted",
      previous,
    });
    assert.deepEqual(await remainingUsers(), [
      { id: 2, users_organizations: [{ organization_id: 1 }] },
    ]);
    assert.deepEqual(await journal(), [
      {
        action: "user.deleted",
        actor_ref: "1",
        actor_type: "user",
        app: "proconnect-identite",
        cause_activity_id: null,
        context: { inputs: { user_id: 1 }, outcome: previous },
        interaction_cid: null,
        moderation_id: null,
        organization_id: null,
        user_id: 1,
      },
    ]);
  });

  it("❎ returns user_not_found and journals nothing for a missing account", async () => {
    const { journal, remainingUsers, runtime } = await given();
    const before = await remainingUsers();

    const outcome = await runtime.user.deleted.mutate({ user_id: 3 });

    assert.deepEqual(outcome, { kind: "user_not_found", user_id: 3 });
    assert.deepEqual(await remainingUsers(), before);
    assert.deepEqual(await journal(), []);
  });
});
