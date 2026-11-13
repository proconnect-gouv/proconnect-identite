//

import { createIdentiteRuntime } from "#src/runtime";
import { createTestDatabase, readActivityLogs } from "#testing";
import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

//

async function given() {
  const db = await createTestDatabase();

  await db.insert(schema.organizations).values([{ id: 1, siret: "🦁" }]);
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
    {
      created_at: "4444-04-04",
      email: "sanguinius@darkangels.world",
      id: 3,
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
    {
      organization_id: 1,
      user_id: 2,
      verification_type: "domain",
      verified_at: "4444-04-04",
    },
    {
      organization_id: 1,
      user_id: 3,
      verification_type: "organization_dirigeant",
      verified_at: "4444-04-04",
    },
  ]);

  return {
    journal: () => readActivityLogs(db),
    memberships: () =>
      db.query.users_organizations.findMany({
        columns: {
          is_external: true,
          user_id: true,
          verification_type: true,
          verified_at: true,
        },
        orderBy: (table, { asc }) => [asc(table.user_id)],
      }),
    runtime: createIdentiteRuntime({ app: "proconnect-identite", db }).as({
      type: "user",
      user_id: 1,
    }),
  };
}

describe("member.updated", () => {
  it("✅ updates the membership, verifies it and journals it under the user", async () => {
    const { journal, memberships, runtime } = await given();

    const outcome = await runtime.member.updated.mutate({
      organization_id: 1,
      user_id: 1,
      verification_type: "organization_dirigeant",
    });

    assert.deepEqual(outcome, {
      activity_id: 1,
      kind: "member_updated",
      previous: {
        is_external: true,
        verification_type: "domain_not_verified_yet",
      },
    });
    const [membership] = await memberships();
    assert.equal(membership?.is_external, true);
    assert.equal(membership?.verification_type, "organization_dirigeant");
    assert.notEqual(membership?.verified_at, null);
    assert.deepEqual(await journal(), [
      {
        action: "member.updated",
        actor_ref: "1",
        actor_type: "user",
        app: "proconnect-identite",
        cause_activity_id: null,
        context: {
          inputs: { verification_type: "organization_dirigeant" },
          outcome: {
            previous: {
              is_external: true,
              verification_type: "domain_not_verified_yet",
            },
          },
        },
        interaction_cid: null,
        moderation_id: null,
        organization_id: 1,
        user_id: 1,
      },
    ]);
  });

  it("✅ renews verified_at when the verification type stays the same", async () => {
    const { journal, memberships, runtime } = await given();

    const outcome = await runtime.member.updated.mutate({
      organization_id: 1,
      renew_verification: true,
      user_id: 3,
      verification_type: "organization_dirigeant",
    });

    assert.equal(outcome.kind, "member_updated");
    const [, , membership] = await memberships();
    assert.equal(membership?.verification_type, "organization_dirigeant");
    assert.notEqual(membership?.verified_at, "4444-04-04 00:00:00+00");
    const [activity] = await journal();
    assert.deepEqual(activity?.context, {
      inputs: {
        renew_verification: true,
        verification_type: "organization_dirigeant",
      },
      outcome: {
        previous: {
          is_external: false,
          verification_type: "organization_dirigeant",
        },
      },
    });
  });

  it("✅ clears verified_at when the membership goes back to domain_not_verified_yet", async () => {
    const { memberships, runtime } = await given();

    await runtime.member.updated.mutate({
      organization_id: 1,
      user_id: 2,
      verification_type: "domain_not_verified_yet",
    });

    const [, membership] = await memberships();
    assert.equal(membership?.verification_type, "domain_not_verified_yet");
    assert.equal(membership?.verified_at, null);
  });

  it("❎ returns membership_unchanged and journals nothing when nothing changes", async () => {
    const { journal, memberships, runtime } = await given();
    const before = await memberships();

    const outcome = await runtime.member.updated.mutate({
      is_external: true,
      organization_id: 1,
      user_id: 1,
      verification_type: "domain_not_verified_yet",
    });

    assert.deepEqual(outcome, {
      kind: "membership_unchanged",
      organization_id: 1,
      user_id: 1,
    });
    assert.deepEqual(await memberships(), before);
    assert.deepEqual(await journal(), []);
  });

  it("❎ returns membership_not_found and journals nothing for a missing link", async () => {
    const { journal, runtime } = await given();

    const outcome = await runtime.member.updated.mutate({
      is_external: false,
      organization_id: 1,
      user_id: 999,
    });

    assert.deepEqual(outcome, {
      kind: "membership_not_found",
      organization_id: 1,
      user_id: 999,
    });
    assert.deepEqual(await journal(), []);
  });
});
