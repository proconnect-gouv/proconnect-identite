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
  await db.insert(schema.email_domains).values([
    {
      domain: "darkangels.world",
      id: 1,
      organization_id: 1,
      verification_type: "verified",
    },
    {
      domain: "calibanites.world",
      id: 2,
      organization_id: 1,
      verification_type: "not_verified_yet",
    },
    {
      domain: "spacewolves.world",
      id: 3,
      organization_id: 2,
      verification_type: "verified",
    },
  ]);

  return {
    db,
    runtime: createIdentiteRuntime({ app: "hyyypertool", db }).as({
      type: "moderator",
      sub: "moderator+removes-darkangels.world",
    }),
  };
}

describe("removeEmailDomain", () => {
  it("✅ removes the email domain and journals it under the moderator", async () => {
    const { db, runtime } = await setup();

    const outcome = await runtime.removeEmailDomain({ email_domain_id: 1 });

    assert.deepEqual(outcome, {
      kind: "domain_removed",
      activity_id: 1,
      domain: "darkangels.world",
      organization_id: 1,
      previous_verification_type: "verified",
    });
    assert.deepEqual(await emailDomainIds(db), [2, 3]);
    assert.deepEqual(await readActivityLogs(db), [
      {
        action: "domain.removed",
        actor_ref: "moderator+removes-darkangels.world",
        actor_type: "moderator",
        app: "hyyypertool",
        cause_activity_id: null,
        context: {
          inputs: { domain: "darkangels.world" },
          outcome: {
            email_domain_id: 1,
            previous_verification_type: "verified",
          },
        },
        interaction_cid: null,
        moderation_id: null,
        organization_id: 1,
        user_id: null,
      },
    ]);
  });

  it("❎ returns domain_not_found and journals nothing for an unknown email domain", async () => {
    const { db, runtime } = await setup();

    const outcome = await runtime.removeEmailDomain({ email_domain_id: 404 });

    assert.deepEqual(outcome, {
      kind: "domain_not_found",
      email_domain_id: 404,
    });
    assert.deepEqual(await emailDomainIds(db), [1, 2, 3]);
    assert.deepEqual(await readActivityLogs(db), []);
  });
});

async function emailDomainIds(db: IdentiteDatabase) {
  const rows = await db.query.email_domains.findMany({
    columns: { id: true },
    orderBy: (table, { asc }) => asc(table.id),
  });
  return rows.map(({ id }) => id);
}
